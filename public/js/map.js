
    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates,
        zoom: 10
    });

    const isDefault = !listing.geometry;

    new mapboxgl.Marker({ color: "red" })
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
                isDefault
                    ? `<h4>${listing.title}</h4><p>Approx Location (Delhi)</p>`
                    : `<h4>${listing.title}</h4><p>Exact Location Shared after booking</p>`
            )
        )
        .addTo(map);
