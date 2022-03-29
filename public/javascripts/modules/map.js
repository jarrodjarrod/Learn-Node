import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: { lat: -68.65833333, lng: 52.44166667 },
  zoom: 8,
};

function loadPlaces(map, lat = -68.65833333, lng = 52.44166667) {
  axios.get(`/api/v1/stores/near?lat=${lat}&lng=${lng}`).then((res) => {
    const places = res.data;
    const bounds = new window.google.maps.LatLngBounds();
    const htmlContent = `
    <div class="popup">
        <p>No stores near here...</p>
    </div>`;
    const infoWindow = new window.google.maps.InfoWindow({
      content: htmlContent,
    });

    if (!places.length) {
      $('.noplaces').classList.remove('hide');
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
      });

      marker.addListener('click', () => {
        infoWindow.open({
          anchor: marker,
          map,
          shouldFocus: false,
        });
      });

      bounds.extend({ lat, lng });
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
      return;
    }

    if (!$('.hide')) $('.noplaces').classList.add('hide');

    const markers = places.map((place) => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };
      const marker = new window.google.maps.Marker({
        map,
        position,
      });
      marker.place = place;
      bounds.extend(position);
      return marker;
    });

    markers.forEach((marker) => {
      marker.addListener('click', function () {
        const html = `
        <div class="popup">
          <a href="/stores/${this.place.slug}">
            <p><strong>${this.place.name}</strong> | ${this.place.location.address}</p>
          </a>
        </div>`;
        infoWindow.setContent(html);
        infoWindow.open({
          anchor: this,
          map,
          shouldFocus: false,
        });
      });

      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
    });
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) return;
  const map = new window.google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);
  const input = $('[name="geolocate"]');
  const dropdown = new window.google.maps.places.Autocomplete(input);
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    loadPlaces(
      map,
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );
  });
}

export default makeMap;
