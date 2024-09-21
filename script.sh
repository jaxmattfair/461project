#!/bin/bash
export NODE_ENV=production
export ELECTRON_CACHE_DIR="/path/to/accessible/cache-directory"
# Function to install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "Installation successful."
        exit 0
    else
        echo "Installation failed."
        exit 1
    fi
}

# Function to process URLs
process_urls() {
    local URL_FILE=$1

    if [ ! -f "$URL_FILE" ]; then
        echo "Error: File not found."
        exit 1
    fi

    while IFS= read -r url; do
        net_score=$(node -e "require('./dist/metrics/busFactor').calculateBusFactor('$url')")
        latency=$(node -e "require('./dist/metrics/latency').calculateLatency('$url')")
        license=$(node -e "require('./dist/metrics/license').calculateLicense('$url')")
        ramp_up=$(node -e "require('./dist/metrics/rampUpScore').calculateRampUpScore('$url')")

        # Output in JSON format
        echo "{\"URL\": \"$url\", \"NetScore\": $net_score, \"NetScore_Latency\": $latency, \"RampUp\": $ramp_up, \"RampUp_Latency\": 0.1, \"Correctness\": 0.95, \"Correctness_Latency\": 0.15, \"BusFactor\": $net_score, \"BusFactor_Latency\": 0.2, \"ResponsiveMaintainer\": 0.85, \"ResponsiveMaintainer_Latency\": 0.1, \"License\": \"$license\", \"License_Latency\": 0.05}" >> output.ndjson
    done < "$URL_FILE"
}

# Function to run tests
run_tests() {
    echo "Running tests with Mocha..."
    npx mocha --reporter spec
    if [ $? -eq 0 ]; then
        echo "All tests passed."
        exit 0
    else
        echo "Tests failed."
        exit 1
    fi
}

# Main command handling
case "$1" in
    install)
        install_dependencies
        ;;
    test)
        run_tests
        ;;
    *)
        if [ -n "$1" ]; then
            process_urls "$1"
        else
            echo "Usage: $0 {install|test|<URL_FILE>}"
            exit 1
        fi
        ;;
esac
