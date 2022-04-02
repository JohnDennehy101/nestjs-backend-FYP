export default function returnCityCoordinates(city: string) {
  const cityCoordinates = {
    Limerick: [52.6638, -8.6267],
    Cork: [51.8985, -8.4756],
    Dublin: [53.3498, -6.2603],
    Galway: [53.2707, -9.0568],
    Waterford: [52.2593, -7.1101],
    Kilkenny: [52.6541, -7.2448],
    London: [51.5072, -0.1276],
    Manchester: [53.483959, -2.244644],
  };

  return cityCoordinates[city];
}
