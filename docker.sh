#!/bin/bash

# Exit immediately if a command fails
set -e

echo "Updating system packages..."
sudo apt update -y
sudo apt upgrade -y

echo "Installing prerequisite packages..."
sudo apt install -y ca-certificates curl gnupg lsb-release

echo "Adding Docker GPG key..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "Adding Docker repository..."
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Installing Docker..."
sudo apt update -y
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Adding current user to docker group..."
sudo usermod -aG docker $USER

echo "Enabling Docker to start on boot..."
sudo systemctl enable docker
sudo systemctl start docker

echo "Docker installation completed!"
echo "You may need to log out and log back in to run docker without sudo."
echo "Check Docker version: docker --version"
echo "Test Docker: docker run hello-world"

