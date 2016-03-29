
function readAll(file)
    local f = io.open(file, "rb")
    local content = f:read("*all")
    f:close()
    return content
end

-- __dirname?

JSON = (loadfile "./Lua/JSON.lua")()

local list = arg[1] or "ship"

local lists = {
	ship = "WikiaShipModules",
	enemy = "WikiaEnemyModules",
	equipment = "WikiaEquipmentModules",
	enemy_equipment = "WikiaEnemyEquipmentModules",
}

local files = JSON:decode(readAll("./Lua/Data/" .. lists[list] .. ".json"))

local tables = {}

for _, v in pairs(files) do
	local load = loadfile("./Lua/Output/Lua/" .. v:gsub("/", ""):gsub("ä", "a") .. ".lua")
	if not load then
		print(v)
	else
		local table = load()
		tables[v] = table
	end
end

local pretty_json_text = JSON:encode_pretty(tables)
print(pretty_json_text)
