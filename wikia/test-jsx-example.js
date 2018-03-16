/* eslint-disable */
import React from 'react'
import {parameter, mapping} from '../lib/jsx'
import {collection} from 'kc/ship-type'
/* eslint-enable */

const ShipType = ({code, type}) =>
  <link target={code}>
    <span className='no-explain' style={{cursor: 'pointer'}} title={type}>
      {code}
      <sup><span style={{color: 'red'}}>?</span></sup>
    </span>
  </link>

ShipType.args = {
  code: parameter(1),
  type: mapping(parameter(1), collection, e => e.code, e => e.name, 'Unknown Type')
}

export default ShipType
