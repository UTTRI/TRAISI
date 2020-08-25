echo "Starting TRAISI staging build."
dotnet build -p:staging=true
echo "TRAISI staging build complete.\n"
echo "Starting TRAISI staging run with --test"
dotnet run --test