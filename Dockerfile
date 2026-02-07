# SWITCH to Ubuntu 24.04 (Noble) which has GLIBC 2.39+
FROM ubuntu:24.04

# Prevent interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install Basic Tools & Dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    unzip \
    wget \
    python3 \
    golang-go \
    ca-certificates \
    gnupg \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Node.js 20 manually (since we aren't using the node base image)
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && apt-get install -y nodejs

# 3. Install Bun
# We explicitly set the install directory to avoid path issues
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"
RUN curl -fsSL https://bun.sh/install | bash

# 4. Install Foundry (for Smart Contracts)
ENV PATH="/root/.foundry/bin:$PATH"
RUN curl -L https://foundry.paradigm.xyz | bash && \
    foundryup

# 5. Install Chainlink CRE CLI
# This will now work because Ubuntu 24.04 has the correct GLIBC
RUN curl -sSL https://cre.chain.link/install.sh | bash && \
    mv /root/.cre/bin/cre /usr/local/bin/cre

# 6. Pre-cache Javy binary (v5.0.4) for Linux x64
# This avoids the download during simulation and ensures availability
RUN mkdir -p /root/.cache/javy/v5.0.4/linux-x64 && \
    curl -L https://github.com/bytecodealliance/javy/releases/download/v5.0.4/javy-x86_64-linux-v5.0.4.gz | gunzip > /root/.cache/javy/v5.0.4/linux-x64/javy && \
    chmod +x /root/.cache/javy/v5.0.4/linux-x64/javy

# 7. Set working directory
WORKDIR /app

# 8. Keep container alive
CMD ["tail", "-f", "/dev/null"]
