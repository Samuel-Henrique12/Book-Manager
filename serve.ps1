#Requires -Version 5.1
<#
    serve.ps1 - Orquestrador do Book Manager

    Uso:
      .\serve.ps1 [comando] [servico]

    Comandos:
      up        (padrao) Sobe tudo via Docker (db + api + web), aguarda ficar pronto e abre o navegador
      down      Para e remove os containers
      reset     Para, remove containers e apaga o volume do banco (dados zerados)
      stop      Apenas para os containers (sem remover)
      restart   Reinicia os containers
      rebuild   Reconstroi as imagens e sobe de novo
      logs      Segue os logs (servico opcional: api | web | db)
      status    Mostra o estado dos containers
      dev       Modo desenvolvimento (hot reload): db no Docker, backend via mvnw, frontend via npm
      help      Mostra esta ajuda

    Exemplos:
      .\serve.ps1              # sobe tudo (Docker)
      .\serve.ps1 up
      .\serve.ps1 logs api
      .\serve.ps1 down
      .\serve.ps1 dev
#>
param(
    [Parameter(Position = 0)]
    [ValidateSet("up", "down", "reset", "stop", "restart", "rebuild", "logs", "status", "dev", "help")]
    [string]$Comando = "up",

    [Parameter(Position = 1)]
    [ValidateSet("api", "web", "db")]
    [string]$Servico
)

$ErrorActionPreference = "Stop"
$raiz = $PSScriptRoot
$portaApi = 8080
$portaWeb = 3000
$urlApi = "http://localhost:$portaApi"
$urlWeb = "http://localhost:$portaWeb"
$urlSwagger = "$urlApi/swagger-ui.html"

# ---- Saida ----
function Acao($msg)   { Write-Host "[*] $msg"  -ForegroundColor Cyan }
function Ok($msg)     { Write-Host "[OK] $msg" -ForegroundColor Green }
function Neutro($msg) { Write-Host "[--] $msg" -ForegroundColor Yellow }
function Aviso($msg)  { Write-Host "[!] $msg"  -ForegroundColor Red }

# ---- Comuns ----
function Test-Docker {
    try { docker info *> $null } catch { throw "Docker nao encontrado. Instale/inicie o Docker Desktop." }
    if ($LASTEXITCODE -ne 0) { throw "O Docker nao esta em execucao. Inicie o Docker Desktop e tente de novo." }
}

function Test-Requisito($nome, $comando) {
    if (-not (Get-Command $comando -ErrorAction SilentlyContinue)) {
        throw "Requisito ausente: $nome (comando '$comando' nao encontrado no PATH)."
    }
}

function Invoke-Compose {
    param([string[]]$Argumentos)
    Push-Location $raiz
    try {
        & docker compose @Argumentos
        if ($LASTEXITCODE -ne 0) { throw "Falha ao executar: docker compose $($Argumentos -join ' ')" }
    }
    finally { Pop-Location }
}

function Wait-Servico($url, $nome, $tentativas = 90) {
    Acao "Aguardando $nome ficar pronto ($url)..."
    for ($i = 1; $i -le $tentativas; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) { Ok "$nome respondeu."; return $true }
        }
        catch { }  # Ainda subindo
        Start-Sleep -Seconds 2
    }
    Aviso "$nome demorou mais que o esperado. Acompanhe com: .\serve.ps1 logs"
    return $false
}

function Show-Banner {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host "   Book Manager esta no ar" -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host "   Web (frontend) : $urlWeb"     -ForegroundColor Cyan
    Write-Host "   API (backend)  : $urlApi"     -ForegroundColor Cyan
    Write-Host "   Swagger        : $urlSwagger" -ForegroundColor Cyan
    Write-Host "   Parar tudo     : .\serve.ps1 down" -ForegroundColor DarkGray
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host ""
}

# ---- Comandos ----
function Comando-Up {
    Test-Docker
    Acao "Subindo containers (db + api + web) com build..."
    Invoke-Compose @("up", "-d", "--build")
    Wait-Servico "$urlApi/actuator/health" "API" | Out-Null
    Wait-Servico $urlWeb "Frontend" | Out-Null
    Acao "Abrindo o navegador..."
    try { Start-Process $urlWeb } catch { Neutro "Nao consegui abrir o navegador automaticamente. Acesse $urlWeb" }
    Show-Banner
}

function Comando-Dev {
    Test-Docker
    Test-Requisito "Node.js" "node"
    Test-Requisito "npm" "npm"
    Acao "Subindo apenas o banco (Docker)..."
    Invoke-Compose @("up", "-d", "db")
    Wait-Servico "$urlApi/actuator/health" "API (aguardando voce iniciar)" 1 | Out-Null

    Acao "Abrindo o backend (mvnw spring-boot:run) em nova janela..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$raiz\backend'; .\mvnw.cmd spring-boot:run"

    Acao "Instalando dependencias do frontend (se necessario) e iniciando o dev server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$raiz\frontend'; if (-not (Test-Path node_modules)) { npm install }; npm run dev"

    Write-Host ""
    Neutro "Modo dev: backend e frontend abriram em janelas separadas (hot reload)."
    Neutro "Backend: $urlApi  |  Frontend: $urlWeb  |  Banco: localhost:5432 (Docker)"
    Neutro "Para parar: feche as janelas e rode .\serve.ps1 stop (para o banco)."
}

function Comando-Logs {
    Push-Location $raiz
    try {
        if ($Servico) { & docker compose logs -f $Servico }
        else { & docker compose logs -f }
    }
    finally { Pop-Location }
}

function Comando-Status {
    Push-Location $raiz
    try { & docker compose ps }
    finally { Pop-Location }
}

function Show-Ajuda {
    Get-Help $PSCommandPath -Detailed | Out-Host
}

# ---- Despacho ----
switch ($Comando) {
    "up"      { Comando-Up }
    "down"    { Test-Docker; Acao "Parando e removendo containers..."; Invoke-Compose @("down"); Ok "Containers removidos." }
    "reset"   { Test-Docker; Acao "Removendo containers e volume do banco..."; Invoke-Compose @("down", "-v"); Ok "Ambiente zerado." }
    "stop"    { Test-Docker; Acao "Parando containers..."; Invoke-Compose @("stop"); Ok "Containers parados." }
    "restart" { Test-Docker; Acao "Reiniciando containers..."; Invoke-Compose @("restart"); Ok "Containers reiniciados." }
    "rebuild" { Test-Docker; Acao "Reconstruindo imagens e subindo..."; Invoke-Compose @("up", "-d", "--build", "--force-recreate"); Show-Banner }
    "logs"    { Test-Docker; Comando-Logs }
    "status"  { Test-Docker; Comando-Status }
    "dev"     { Comando-Dev }
    "help"    { Show-Ajuda }
}
