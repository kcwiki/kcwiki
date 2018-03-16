// Todo: use api_start2 and translation files.
export default class ShipType {
  constructor (id, jpName, code, name) {
    this.id = id
    this.jpName = jpName
    this.code = code
    this.name = name
  }

  static get collection () {
    return [
      new ShipType(-1, '', 'DE', 'Coastal Defense Ship'),
      new ShipType(-1, '', 'DD', 'Destroyer'),
      new ShipType(-1, '', 'CL', 'Light Cruiser'),
      new ShipType(-1, '', 'CLT', 'Torpedo Cruiser'),
      new ShipType(-1, '', 'CA', 'Heavy Cruiser'),
      new ShipType(-1, '', 'CAV', 'Aviation Cruiser'),
      new ShipType(-1, '', 'CVL', 'Light Carrier'),
      new ShipType(-1, '', 'FBB', 'Fast Battleship'),
      new ShipType(-1, '', 'BB', 'Battleship'),
      new ShipType(-1, '', 'BBV', 'Aviation Battleship'),
      new ShipType(-1, '', 'CV', 'Standard Carrier'),
      new ShipType(-1, '', 'SS', 'Submarine'),
      new ShipType(-1, '', 'SSV', 'Aircraft Carrying Submarine'),
      new ShipType(-1, '', 'AV', 'Seaplane Tender'),
      new ShipType(-1, '', 'LHA', 'Amphibious Assault Ship'),
      new ShipType(-1, '', 'CVB', 'Armored Carrier'),
      new ShipType(-1, '', 'AR', 'Repair Ship'),
      new ShipType(-1, '', 'AS', 'Submarine Tender'),
      new ShipType(-1, '', 'CT', 'Training Cruiser'),
      new ShipType(-1, '', 'AO', 'Fleet Oiler')
    ]
  }
}

export const collection = ShipType.collection
