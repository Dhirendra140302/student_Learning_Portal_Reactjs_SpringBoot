@echo off
set JAVA_HOME=C:\Users\dhire\.jdk\jdk-25.0.2
set PATH=C:\Users\dhire\.maven\maven-3.9.15\bin;%JAVA_HOME%\bin;%PATH%
echo Starting Spring Boot backend...
echo JAVA_HOME=%JAVA_HOME%
mvn spring-boot:run
