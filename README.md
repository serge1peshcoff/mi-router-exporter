# mi-router-exporter

Reads Mi Router data from the API and exports it in a Prometheus format.

## How does it work?
- It fetches the data from the Mi Router API ...
- ... parses it ...
- ... and exposes it in a format that Prometheus can consume.

## How to run it?
1. Clone this repo and `cd` there
2. Build the container:

```
docker build -t mi-router-exporter .
```

3. Run the container (for configuration, see below):

```
docker run -it \
    -d --name=mi-router-exporter \
    -e URL=<insert your router IP [<OPTIONAL> - default: 192.168.31.1> \
    -e PASSWORD=<insert your admin password here> \
    -p 3030:3030 \
    --label com.centurylinklabs.watchtower.enable=false \ # so it won't be restarter by Watchtower if it's running
    --restart unless-stopped \ # so it would start together with the system
    mi-router-exporter
```

4. Open `http://localhost:3030` in browser, it should display metrics.
5. If there were errors, check out the container logs.


## Configration

All the configuration is done through the environmental variables.
- `LOG_LEVEL` - integration logging level. Default: `warn`. If something isn't working, try setting it to `debug` and check what's inside.
- `PASSWORD` - Mi Router admin URL. Will throw an exception if this is not set.

# Grafana integration

Check `grafana-dashboard.json` for JSON dashboard file to be consumed by Grafana.
