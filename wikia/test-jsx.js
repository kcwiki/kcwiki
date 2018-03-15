import {compile} from 'lib/jsx'
import example from './test-jsx-example'

console.log(compile(example))
// [[{{{1}}}|<span class="no-explain" style="cursor:pointer" title="{{#switch:{{{1}}}|DE=Coastal Defense Ship|DD=Destroyer}}">{{{1}}}<sup><span style="color:red">?</span></sup></span>]]
