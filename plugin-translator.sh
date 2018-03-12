node wikia/fetch run
node wikia/translations

cp data/wikia/ship_names.json ../plugin-translator/i18n_source/ship/en-US.json
cp data/wikia/equipment_names.json ../plugin-translator/i18n_source/slotitem/en-US.json
cp data/wikia/enemy_equipment_names.json ../plugin-translator/i18n_source/slotitem-abyssal/en-US.json

s="$(head -c -3 data/wikia/enemy_names.json)"
printf "$s,\n\n" > ../plugin-translator/i18n_source/ship-abyssal/en-US.json
cat data/misc/extra_enemy_names.txt >> ../plugin-translator/i18n_source/ship-abyssal/en-US.json
printf "\n}\n" >> ../plugin-translator/i18n_source/ship-abyssal/en-US.json

cp data/wikia/ship_type_names.json ../plugin-translator/i18n_source/shipType/en-US.json
cp data/wikia/equipment_type_names.json ../plugin-translator/i18n_source/slotitemType/en-US.json

cp data/wikia/item_names.json ../plugin-translator/i18n_source/useitem/en-US.json
