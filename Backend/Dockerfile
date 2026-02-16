# .NET Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY Backend/BankingAPI/*.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY Backend/BankingAPI/ ./
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .

# Expose port
EXPOSE 5200

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5200
ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "BankingAPI.dll"]
