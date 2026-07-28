#Requires -Version 5.1
<#
    serve.ps1 - Orquestrador do Book Manager

    Uso:
      .\serve.ps1 [comando] [servico]

    Comandos:
      up        (padrao) Sobe tudo via Docker (db + api + web), aguarda ficar pronto e abre o navegador
      down      Para e remove os containers e encerra o que o modo dev deixou rodando
      reset     Para, remove containers e apaga o volume do banco (dados zerados)
      stop      Apenas para os containers (sem remover) e encerra o modo dev
      restart   Reinicia os containers
      rebuild   Reconstroi as imagens e sobe de novo
      logs      Segue os logs (servico opcional: api | web | db)
      status    Mostra o estado dos containers e quem esta ocupando as portas
      portas    Mostra apenas quem esta ocupando as portas 3000 / 8080 / 5432
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
    [ValidateSet("up", "down", "reset", "stop", "restart", "rebuild", "logs", "status", "portas", "dev", "help")]
    [string]$Comando = "up",

    [Parameter(Position = 1)]
    [ValidateSet("api", "web", "db")]
    [string]$Servico
)

$ErrorActionPreference = "Stop"
$raiz = $PSScriptRoot

# Leitura do .env
function Get-ValorEnv($chave, $padrao) {
    $arquivo = Join-Path $raiz ".env"
    if (Test-Path $arquivo) {
        foreach ($linha in (Get-Content $arquivo)) {
            $texto = $linha.Trim()
            if ($texto -eq "" -or $texto.StartsWith("#")) { continue }
            $partes = $texto.Split("=", 2)
            if ($partes.Count -eq 2 -and $partes[0].Trim() -eq $chave) {
                $valor = $partes[1].Trim()
                if ($valor -ne "") { return $valor }
            }
        }
    }
    return $padrao
}

$portaApi = [int](Get-ValorEnv "API_PORT" "8080")
$portaWeb = [int](Get-ValorEnv "WEB_PORT" "3000")
$portaDb = [int](Get-ValorEnv "DB_PORT" "5432")
$portaMail = [int](Get-ValorEnv "MAIL_UI_PORT" "8025")
$nomeBanco = Get-ValorEnv "DB_NAME" "bookmanager"
$usuarioBanco = Get-ValorEnv "DB_USERNAME" "bookmanager"
$senhaBanco = Get-ValorEnv "DB_PASSWORD" "bookmanager"
$urlApi = "http://localhost:$portaApi"
$urlWeb = "http://localhost:$portaWeb"
$urlSwagger = "$urlApi/swagger-ui.html"

# Containers Deste Compose
$containersProprios = @("bookmanager-db", "bookmanager-api", "bookmanager-web", "bookmanager-mail")

# Processos Fora do Docker
$processosDev = @("node", "java", "javaw")

# Listeners Internos do Docker Desktop
$relaysDocker = @("com.docker.backend", "wslrelay", "vpnkit", "Idle", "System")

# Registro dos PIDs abertos pelo modo dev
$arquivoPids = Join-Path $raiz ".serve-dev.pids"

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

# ---- Portas ----
function Get-ContainerNaPorta($porta) {
    $nomes = & docker ps --filter "publish=$porta" --format "{{.Names}}"
    if ($LASTEXITCODE -ne 0) { return $null }
    $lista = @($nomes | Where-Object { $_ -and $_.Trim() })
    if ($lista.Count -eq 0) { return $null }
    return $lista[0].Trim()
}

function Get-ProcessoNaPorta($porta) {
    $conexoes = Get-NetTCPConnection -State Listen -LocalPort $porta -ErrorAction SilentlyContinue
    if (-not $conexoes) { return $null }
    foreach ($id in ($conexoes | Select-Object -ExpandProperty OwningProcess -Unique)) {
        $proc = Get-Process -Id $id -ErrorAction SilentlyContinue
        if ($null -eq $proc) { continue }
        if ($relaysDocker -contains $proc.ProcessName) { continue }
        return $proc
    }
    return $null
}

function Get-OcupanteDaPorta($porta) {
    $container = Get-ContainerNaPorta $porta
    if ($container) {
        $proprio = $containersProprios -contains $container
        return [PSCustomObject]@{ Tipo = "container"; Nome = $container; Id = $null; Proprio = $proprio }
    }
    $proc = Get-ProcessoNaPorta $porta
    if ($proc) {
        return [PSCustomObject]@{ Tipo = "processo"; Nome = $proc.ProcessName; Id = $proc.Id; Proprio = $false }
    }
    return $null
}

function Show-Portas {
    Write-Host ""
    Write-Host "Porta  Servico     Ocupada por" -ForegroundColor DarkGray
    Write-Host "-----  ----------  -----------------------------------" -ForegroundColor DarkGray
    foreach ($item in @(
            @{ Porta = $portaWeb;  Rotulo = "frontend" },
            @{ Porta = $portaApi;  Rotulo = "backend " },
            @{ Porta = $portaDb;   Rotulo = "banco   " },
            @{ Porta = $portaMail; Rotulo = "e-mail  " })) {
        $dono = Get-OcupanteDaPorta $item.Porta
        if ($null -eq $dono) {
            Write-Host ("{0,-6} {1,-11} livre" -f $item.Porta, $item.Rotulo) -ForegroundColor Green
        }
        elseif ($dono.Tipo -eq "container") {
            $sufixo = "container de OUTRO projeto"
            if ($dono.Proprio) { $sufixo = "container deste projeto" }
            Write-Host ("{0,-6} {1,-11} {2} ({3})" -f $item.Porta, $item.Rotulo, $dono.Nome, $sufixo) -ForegroundColor Yellow
        }
        else {
            Write-Host ("{0,-6} {1,-11} processo {2} (PID {3})" -f $item.Porta, $item.Rotulo, $dono.Nome, $dono.Id) -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

function Test-PortasLivres {
    $bloqueios = @()
    foreach ($item in @(
            @{ Porta = $portaWeb;  Rotulo = "frontend" },
            @{ Porta = $portaApi;  Rotulo = "backend" },
            @{ Porta = $portaDb;   Rotulo = "banco" },
            @{ Porta = $portaMail; Rotulo = "e-mail" })) {
        $dono = Get-OcupanteDaPorta $item.Porta
        if ($null -eq $dono) { continue }
        if ($dono.Tipo -eq "container") {
            # Container proprio sera recriado pelo compose
            if ($dono.Proprio) { continue }
            $bloqueios += "Porta $($item.Porta) ($($item.Rotulo)) esta com o container '$($dono.Nome)', de outro projeto. Pare com: docker stop $($dono.Nome)"
        }
        else {
            $bloqueios += "Porta $($item.Porta) ($($item.Rotulo)) esta com o processo $($dono.Nome) (PID $($dono.Id)). Se sobrou do modo dev, rode: book-manager-down"
        }
    }
    if ($bloqueios.Count -gt 0) {
        Write-Host ""
        foreach ($b in $bloqueios) { Aviso $b }
        Neutro "Libere as portas acima, ou defina WEB_PORT / API_PORT / DB_PORT no .env para este projeto usar outras."
        Write-Host ""
        exit 1
    }
}

# ---- Modo Dev ----
function Stop-ProcessosDev {
    $encerrados = @()

    # Janelas abertas pelo modo dev
    if (Test-Path $arquivoPids) {
        foreach ($linha in (Get-Content $arquivoPids)) {
            $id = 0
            if (-not [int]::TryParse($linha.Trim(), [ref]$id)) { continue }
            if ($id -le 0) { continue }
            if ($null -eq (Get-Process -Id $id -ErrorAction SilentlyContinue)) { continue }
            try { & taskkill /PID $id /T /F | Out-Null } catch { }
            $encerrados += "janela do modo dev (PID $id)"
        }
        Remove-Item $arquivoPids -Force -ErrorAction SilentlyContinue
    }

    # Sobras nas portas do projeto (npm run dev / mvnw orfaos)
    foreach ($porta in @($portaWeb, $portaApi)) {
        $dono = Get-OcupanteDaPorta $porta
        if ($null -eq $dono) { continue }
        if ($dono.Tipo -eq "container") { continue }
        if ($processosDev -notcontains $dono.Nome) {
            Neutro "Porta $porta esta com '$($dono.Nome)' (PID $($dono.Id)), que nao e do projeto. Deixei rodando."
            continue
        }
        try { & taskkill /PID $($dono.Id) /T /F | Out-Null } catch { }
        $encerrados += "$($dono.Nome) na porta $porta (PID $($dono.Id))"
    }

    foreach ($e in $encerrados) { Ok "Encerrado: $e" }
    if ($encerrados.Count -eq 0) { Neutro "Nada do modo dev estava rodando." }
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
    Write-Host "   E-mails (dev)  : http://localhost:$portaMail" -ForegroundColor Cyan
    Write-Host "   Parar tudo     : book-manager-down (ou .\serve.ps1 down)" -ForegroundColor DarkGray
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host ""
}

# ---- Comandos ----
function Comando-Up {
    Test-Docker
    Test-PortasLivres
    Acao "Subindo containers (db + api + web) com build..."
    Neutro "A primeira build baixa as dependencias (alguns minutos). As seguintes reaproveitam o cache."
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
    Test-PortasLivres
    Acao "Subindo apenas o banco (Docker)..."
    Invoke-Compose @("up", "-d", "db")

    # Ambiente do backend segue as portas configuradas
    $urlBanco = "jdbc:postgresql://localhost:$portaDb/$nomeBanco"
    $envApi = "`$env:DB_URL='$urlBanco'; `$env:DB_USERNAME='$usuarioBanco'; `$env:DB_PASSWORD='$senhaBanco'; `$env:PORT='$portaApi'; `$env:CORS_ORIGENS='$urlWeb'"

    Acao "Abrindo o backend (mvnw spring-boot:run) em nova janela..."
    $procApi = Start-Process powershell -PassThru -ArgumentList "-NoExit", "-Command", "Set-Location '$raiz\backend'; $envApi; .\mvnw.cmd spring-boot:run"

    Acao "Instalando dependencias do frontend (se necessario) e iniciando o dev server..."
    $envWeb = "`$env:NEXT_PUBLIC_API_URL='$urlApi'; `$env:PORT='$portaWeb'"
    $procWeb = Start-Process powershell -PassThru -ArgumentList "-NoExit", "-Command", "Set-Location '$raiz\frontend'; $envWeb; if (-not (Test-Path node_modules)) { npm install }; npm run dev"

    # Registro dos PIDs para o down conseguir encerrar depois
    Set-Content -Path $arquivoPids -Value @($procApi.Id, $procWeb.Id) -Encoding utf8

    Write-Host ""
    Neutro "Modo dev: backend e frontend abriram em janelas separadas (hot reload)."
    Neutro "Backend: $urlApi  |  Frontend: $urlWeb  |  Banco: localhost:$portaDb (Docker)"
    Neutro "Para parar tudo (janelas + banco): book-manager-down (ou .\serve.ps1 down)"
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
    Show-Portas
}

function Show-Ajuda {
    Get-Help $PSCommandPath -Detailed | Out-Host
}

# ---- Despacho ----
switch ($Comando) {
    "up"      { Comando-Up }
    "down"    { Test-Docker; Acao "Encerrando modo dev..."; Stop-ProcessosDev; Acao "Parando e removendo containers..."; Invoke-Compose @("down"); Ok "Ambiente parado." }
    "reset"   { Test-Docker; Acao "Encerrando modo dev..."; Stop-ProcessosDev; Acao "Removendo containers e volume do banco..."; Invoke-Compose @("down", "-v"); Ok "Ambiente zerado." }
    "stop"    { Test-Docker; Acao "Encerrando modo dev..."; Stop-ProcessosDev; Acao "Parando containers..."; Invoke-Compose @("stop"); Ok "Containers parados." }
    "restart" { Test-Docker; Acao "Reiniciando containers..."; Invoke-Compose @("restart"); Ok "Containers reiniciados." }
    "rebuild" { Test-Docker; Test-PortasLivres; Acao "Reconstruindo imagens e subindo..."; Invoke-Compose @("up", "-d", "--build", "--force-recreate"); Show-Banner }
    "logs"    { Test-Docker; Comando-Logs }
    "status"  { Test-Docker; Comando-Status }
    "portas"  { Test-Docker; Show-Portas }
    "dev"     { Comando-Dev }
    "help"    { Show-Ajuda }
}
