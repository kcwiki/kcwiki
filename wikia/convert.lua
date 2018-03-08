function read(file)
  local f = io.open(file, 'rb')
  local content = f:read('*all')
  f:close()
  return content
end

function write(file, string)
  local f = io.open(file, 'w')
  f:write(string)
  f:close()
end

dirname = arg[1]
dataDir = dirname .. '/../data/wikia'

JSON = (loadfile (dirname .. '/../lib/external/json.lua'))()

local data = JSON:decode(read(dataDir .. '/modules.json'))
local filenames = JSON:decode(read(dataDir .. '/module_filenames.json'))

local tables = {}

for category, categoryData in pairs(data) do
  tables[category] = {}
  for _, page in ipairs(categoryData) do
    local filename = filenames[page]
    local load = loadfile(dataDir .. '/lua/' .. filename .. '.lua')
    if not load then
      print(page)
    else
      local table = load()
      tables[category][page] = table
    end
  end
end

write(dataDir .. '/data.json', JSON:encode_pretty(tables))
