#!/bin/bash

# Build Fluig Changelog Widget
# Script que compila Vue e empacota WAR em sequência

set -e

echo "================================"
echo "Building ProjetoFluig Widget"
echo "================================"
echo ""

# Step 1: Build Vue
echo "Step 1: Compilando Vue..."
cd widget-thais-vue
npm install
npm run build
cd ..
echo "Vue compilado: wcm/widget/Widget_thais/src/main/webapp/resources/js/app-vue/"
echo ""

# Step 2: Build Maven/WAR
echo "Step 2: Compilando Maven/WAR..."
cd wcm/widget/Widget_thais
mvn clean package -DskipTests
cd ../../..
echo "WAR empacotada: wcm/widget/Widget_thais/target/Widget_thais.war"
echo ""

# Step 3: Summary
echo "================================"
echo "BuildCompleto!"
echo "================================"
echo "WAR pronta para deploy em:"
echo "  wcm/widget/Widget_thais/target/Widget_thais.war"
ls -lh wcm/widget/Widget_thais/target/Widget_thais.war
