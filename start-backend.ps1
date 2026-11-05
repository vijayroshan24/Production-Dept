$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$jdk = 'D:\Tools\temurin-21.0.13\jdk-21.0.13+9'
$maven = 'D:\Tools\apache-maven-3.10.0\bin\mvn.cmd'
$settings = 'D:\Tools\maven-settings.xml'
if (-not (Test-Path (Join-Path $jdk 'bin\java.exe'))) { throw "Temurin JDK 21 is not installed at $jdk" }
if (-not (Test-Path $maven)) { throw "Maven is not installed at D:\Tools\apache-maven-3.10.0" }
$env:JAVA_HOME = $jdk
$env:PATH = (Join-Path $jdk 'bin') + ';D:\Tools\apache-maven-3.10.0\bin;' + $env:PATH
& $maven -s $settings -f (Join-Path $project 'backend\pom.xml') spring-boot:run
exit $LASTEXITCODE
