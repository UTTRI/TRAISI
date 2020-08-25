#!/usr/bin/env bash

update_npm () {
    if test -f "package.json"; then
        npm install
        npm run build
    fi
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd ${DIR}
echo "Clean and restore project root"
dotnet clean
dotnet restore

echo "Update Traisi.Sdk"
cd ${DIR}/src/Traisi.Sdk
dotnet build -c cli

cd ${DIR}/src/Traisi.Sdk/Client
update_npm

echo "Update Traisi.Questions"
cd ${DIR}/src/Traisi.Questions
if test -f "package.json"; then
    npm install
    npm run staging
fi

echo "Update Traisi.Tripdiary"
cd ${DIR}/src/Traisi.TripDiary
dotnet restore
dotnet clean
cd ${DIR}/src/Traisi.TripDiary/src
update_npm
cd ${DIR}/src/Traisi.TripDiary
dotnet build

echo "Update Traisi.ClientApp"
cd ${DIR}/src/Traisi.ClientApp
update_npm

echo "Build Project"
cd ${DIR}/src/Traisi
dotnet build
