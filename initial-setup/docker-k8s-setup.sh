#!/bin/bash
set -e
echo "Checking for Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing now..."
    sudo apt update -y
    sudo apt install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
      | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update -y
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    sudo usermod -aG docker ubuntu
    
    sudo systemctl enable docker --now
else
    echo "Docker is already installed. Skipping installation."
fi

echo "Checking for existing Kubernetes cluster..."
sudo hostnamectl set-hostname master

if [ ! -f "/etc/kubernetes/admin.conf" ]; then
    echo "No existing cluster found. Initializing master node with kubeadm..."
   
    
    sudo kubeadm init --cri-socket=unix:///var/run/crio/crio.sock --pod-network-cidr=10.42.0.0/16
    
    sudo mkdir -p /home/ubuntu/.kube
    sudo cp /etc/kubernetes/admin.conf /home/ubuntu/.kube/config
    sudo chown ubuntu:ubuntu /home/ubuntu/.kube/config
else
    echo "A Kubernetes cluster is already initialized. Skipping kubeadm init."
fi

echo "Checking for CNI installation..."

if ! sudo -u ubuntu kubectl get daemonset weave-net -n kube-system &> /dev/null; then
    echo "Weave CNI not found. Installing..."
    sudo -u ubuntu kubectl apply -f https://github.com/weaveworks/weave/releases/download/v2.8.1/weave-daemonset-k8s.yaml
else
    echo "Weave CNI is already installed. Skipping."
fi

echo "Waiting for node to become Ready..."
until sudo -u ubuntu kubectl get nodes | grep -q ' Ready '; do sleep 5; done
echo "Node is Ready."

echo "Removing taint to allow pods to run on the master node..."
sudo -u ubuntu kubectl taint node $(hostname) node-role.kubernetes.io/control-plane:NoSchedule- || true

echo "Waiting for kube-system pods to be Ready..."

until [ "$(sudo -u ubuntu kubectl get pods -n kube-system --field-selector=status.phase!=Running,status.phase!=Succeeded | tail -n +2 | wc -l)" -eq 0 ]; do sleep 5; done


echo "Bootstrap complete."
