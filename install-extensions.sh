#!/bin/bash

echo "Atualizando extensões do VS Code..."

code --install-extension esbenp.prettier-vscode --force
code --install-extension usernamehw.errorlens --force
code --install-extension Fluiggers.fluiggers-fluig-vscode-extension --force
code --install-extension supermaven.supermaven --force
code --install-extension ms-vsliveshare.vsliveshare --force
code --install-extension donjayamanne.git-extension-pack --force
code --install-extension EditorConfig.EditorConfig --force
code --install-extension quick-lint.quick-lint-js --force

echo "Extensões verificadas e atualizadas."