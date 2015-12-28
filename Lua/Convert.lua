
function readAll(file)
    local f = io.open(file, "rb")
    local content = f:read("*all")
    f:close()
    return content
end

-- __dirname?

JSON = (loadfile "./Lua/JSON.lua")()

local enemy = arg[1] == "enemy"

local files = JSON:decode(readAll("./Lua/Data/Wikia" .. (enemy and "Enemy" or "Ship") .. "Modules.json"))

local tables = {}

for k, v in pairs(files) do
	local table = (loadfile("./Lua/Output/Lua/" .. v .. ".lua"))()
	tables[v] = table
end

local pretty_json_text = JSON:encode_pretty(tables)
print(pretty_json_text)
