#Requires -Version 5.1
<#
    instalar-comandos.ps1 - Registra os comandos globais do Book Manager

    Cria funcoes 'book-manager-*' no perfil do PowerShell, apontando para o
    serve.ps1 deste diretorio. Funcionam de qualquer pasta, sem depender do
    diretorio atual e sem conflitar com o alias 'serve' de outros projetos.

    Uso:
      .\instalar-comandos.ps1            # instala ou atualiza
      .\instalar-comandos.ps1 -Remover   # desinstala
#>
param(
    [switch]$Remover
)

$ErrorActionPreference = "Stop"

function Acao($msg)   { Write-Host "[*] $msg"  -ForegroundColor Cyan }
function Ok($msg)     { Write-Host "[OK] $msg" -ForegroundColor Green }
function Neutro($msg) { Write-Host "[--] $msg" -ForegroundColor Yellow }
function Aviso($msg)  { Write-Host "[!] $msg"  -ForegroundColor Red }

$marcaInicio = "# >>> Book Manager - comandos globais >>>"
$marcaFim = "# <<< Book Manager - comandos globais <<<"

$caminhoServe = Join-Path $PSScriptRoot "serve.ps1"
if (-not (Test-Path $caminhoServe)) {
    Aviso "serve.ps1 nao encontrado em: $caminhoServe"
    exit 1
}

# ---- Perfis alvo ----
function Get-PerfisAlvo {
    $lista = @($PROFILE.CurrentUserAllHosts)

    # PowerShell 7 usa uma pasta propria - so incluir se o pwsh estiver instalado
    if (Get-Command pwsh -ErrorAction SilentlyContinue) {
        $pastaDocs = Split-Path -Parent (Split-Path -Parent $PROFILE.CurrentUserAllHosts)
        $perfil7 = Join-Path $pastaDocs "PowerShell\profile.ps1"
        if ($lista -notcontains $perfil7) { $lista += $perfil7 }
    }
    return $lista
}

function Remove-BlocoAntigo($conteudo) {
    if ([string]::IsNullOrEmpty($conteudo)) { return "" }
    $padrao = [regex]::Escape($marcaInicio) + "[\s\S]*?" + [regex]::Escape($marcaFim)
    return ([regex]::Replace($conteudo, $padrao, "")).TrimEnd()
}

# ---- Bloco de comandos ----
$modelo = @'

# >>> Book Manager - comandos globais >>>
# Gerado por instalar-comandos.ps1 - nao editar a mao.
function book-manager         { & "__SERVE__" @args }
function book-manager-up      { & "__SERVE__" up @args }
function book-manager-down    { & "__SERVE__" down @args }
function book-manager-dev     { & "__SERVE__" dev @args }
function book-manager-stop    { & "__SERVE__" stop @args }
function book-manager-restart { & "__SERVE__" restart @args }
function book-manager-reset   { & "__SERVE__" reset @args }
function book-manager-rebuild { & "__SERVE__" rebuild @args }
function book-manager-logs    { & "__SERVE__" logs @args }
function book-manager-status  { & "__SERVE__" status @args }
function book-manager-portas  { & "__SERVE__" portas @args }
function book-manager-help    { & "__SERVE__" help @args }
# <<< Book Manager - comandos globais <<<
'@

$bloco = $modelo.Replace("__SERVE__", $caminhoServe)

# ---- Execucao ----
$perfis = Get-PerfisAlvo
Write-Host ""

foreach ($perfil in $perfis) {
    $pasta = Split-Path -Parent $perfil
    if (-not (Test-Path $pasta)) {
        if ($Remover) { continue }
        New-Item -ItemType Directory -Path $pasta -Force | Out-Null
    }

    $atual = ""
    if (Test-Path $perfil) { $atual = Get-Content $perfil -Raw -ErrorAction SilentlyContinue }

    $limpo = Remove-BlocoAntigo $atual

    if ($Remover) {
        if ($limpo -eq $atual.TrimEnd()) {
            Neutro "Nada a remover em: $perfil"
            continue
        }
        Set-Content -Path $perfil -Value ($limpo + "`r`n") -Encoding UTF8
        Ok "Comandos removidos de: $perfil"
        continue
    }

    Set-Content -Path $perfil -Value ($limpo + "`r`n" + $bloco + "`r`n") -Encoding UTF8
    Ok "Comandos registrados em: $perfil"
}

if ($Remover) {
    Write-Host ""
    Neutro "Abra uma NOVA janela do PowerShell para as mudancas valerem."
    Write-Host ""
    return
}

# Politica de execucao precisa permitir o carregamento do perfil
$politica = Get-ExecutionPolicy -Scope CurrentUser
if ($politica -eq "Restricted") {
    Write-Host ""
    Aviso "A politica de execucao esta 'Restricted' - o perfil do PowerShell nao sera carregado."
    Neutro "Para liberar: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "   Comandos do Book Manager instalados" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "   book-manager-up        Sobe tudo (db + api + web)"     -ForegroundColor Cyan
Write-Host "   book-manager-down      Para tudo, inclusive o modo dev" -ForegroundColor Cyan
Write-Host "   book-manager-dev       Modo dev com hot reload"         -ForegroundColor Cyan
Write-Host "   book-manager-portas    Quem esta ocupando 3000/8080/5432" -ForegroundColor Cyan
Write-Host "   book-manager-status    Estado dos containers"           -ForegroundColor Cyan
Write-Host "   book-manager-logs api  Logs (api | web | db)"           -ForegroundColor Cyan
Write-Host "   book-manager-stop / -restart / -reset / -rebuild"       -ForegroundColor DarkGray
Write-Host "   book-manager <cmd>     Forma generica"                  -ForegroundColor DarkGray
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Neutro "Rodam de qualquer diretorio e apontam sempre para: $caminhoServe"
Neutro "O comando 'serve' continua sendo do outro projeto - nao foi alterado."
Neutro "Abra uma NOVA janela do PowerShell para comecar a usar."
Write-Host ""
