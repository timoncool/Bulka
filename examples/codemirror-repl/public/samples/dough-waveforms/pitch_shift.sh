#!/bin/bash
find . -type f -name "*.wav" -exec bash -c 'sox "$0" "${0%.wav}_down.wav" pitch -200' {} \;

