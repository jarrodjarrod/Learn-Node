function autoComplete(input, latInput, lngInput) {
  if (!input) return;
  const dropdown = new window.google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();w
  });

  input.on('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });
}

export default autoComplete;
