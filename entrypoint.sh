#!/bin/bash
x11vnc -forever -usepw -create  -auth /home/someuser/.Xauthority  --noxdamage & xvfb-run --server-args="-screen 0 1024x768x24" npm start 
