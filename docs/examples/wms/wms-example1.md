---
layout: tutorial_frame
title: WMS example
---
<script type='text/javascript'>

	const map = L.map('map', {
		center: [-17, -67],
		zoom: 3
	});

	const wmsLayer = L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
		layers: 'TOPO-OSM-WMS'
	}).addTo(map);

</script>
