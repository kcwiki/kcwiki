/// <reference path="../../typings/node/node.d.ts" />

import * as http from "http";
import * as Storage from "../Storage";

function materials(user: Storage.Object): any {
    return user.get("materials").map((mat: any, i: number) => {
        return {
            "api_member_id": parseInt(user.get2("basic", "api_member_id")),
            "api_id": i + 1,
            "api_value": mat,
        };
    });
}

function fleets(user: Storage.Object): any {
    return user.get("fleets").map((fleet: any, i: number) => {
        return {
            "api_member_id": parseInt(user.get2("basic", "api_member_id")),
            "api_id": i + 1,
            "api_name": fleet.name,
            "api_name_id": "",
            "api_mission": fleet.mission,
            "api_flagship": "0",
            "api_ship": fleet.ships,

        };
    });
}

function docks(user: Storage.Object): any {
    return user.get("docks").map((dock: any, i: number) => {
        return {
            "api_member_id": parseInt(user.get2("basic", "api_member_id")),
            "api_id": i + 1,
            "api_state": dock,
            "api_ship_id": 0,
            "api_complete_time": 0,
            "api_complete_time_str": "0",
            "api_item1": 0,
            "api_item2": 0,
            "api_item3": 0,
            "api_item4": 0,
        };
    });
}

function ships(user: Storage.Object): any {
    return user.get("ships").map((ship: any, i: number) => {
        const s = {
            "api_id": ship.id,
            "api_sortno": ship.sortno,
            "api_ship_id": ship.api_id,
            "api_lv": ship.lv,
            // todo
            "api_exp": [0, 100, 0],
            "api_nowhp": 100,
            "api_maxhp": 100,
            "api_leng": 2,
            "api_slot": [-1, -1, -1, -1, -1],
            "api_onslot": [0, 0, 0, 0, 0],
            "api_slot_ex": 0,
            "api_kyouka": [0, 0, 0, 0, 0],
            "api_backs": 1,
            "api_fuel": 0,
            "api_bull": 0,
            "api_slotnum": 4,
            "api_ndock_time": 0,
            "api_ndock_item": [0, 0],
            "api_srate": 0,
            "api_cond": 49,
            "api_karyoku": [0, 0],
            "api_raisou": [0, 0],
            "api_taiku": [0, 0],
            "api_soukou": [0, 0],
            "api_kaihi": [0, 0],
            "api_taisen": [0, 0],
            "api_sakuteki": [0, 0],
            "api_lucky": [0, 0],
            "api_locked": 0,
            "api_locked_equip": 0,
        };
        return s;
    });
}

function svData(obj: any): string {
    return `svdata={"api_result":1,"api_result_msg":"成功","api_data":${JSON.stringify(obj)}}`;
}

export function getTable(user: Storage.Object) {

    function api_get_member_basic(res: http.ServerResponse): void {
        res.end(svData(user.get("basic")));
    }

    function api_get_member_furniture(res: http.ServerResponse): void {
        const obj = user.get2("basic", "api_furniture").map((n: any, i: number) => {
            return {
                "api_member_id": i + 1,
                "api_id": n,
                "api_furniture_type": i,
                "api_furniture_no": 0,
                "api_furniture_id": n,
            };
        });
        res.end(svData(obj));
    }

    function api_port_port(res: http.ServerResponse): void {
        const obj: any = {
            api_material: materials(user),
            api_deck_port: fleets(user),
            api_ndock: docks(user),
            api_ship: ships(user),
            api_basic: user.get("basic"),
            api_log: [],
            "api_p_bgm_id": user.get("bgm"),
            "api_parallel_quest_count": user.get("parallel_quest_count"),
        };
        res.end(svData(obj));
    }

    const table: { [name: string]: (res: http.ServerResponse) => void } = {
        "api_get_member/basic": api_get_member_basic,
        "api_get_member/furniture": api_get_member_furniture,
        "api_port/port": api_port_port,
    };

    return table;

}
