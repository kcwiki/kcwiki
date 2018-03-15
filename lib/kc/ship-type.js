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
      new ShipType(1, '', 'DE', 'Coastal Defense Ship'),
      new ShipType(2, '', 'DD', 'Destroyer')
    ]
  }
}

export const collection = ShipType.collection
