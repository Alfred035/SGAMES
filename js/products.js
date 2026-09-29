/**
 * SGAMES v1.2
 * Catálogo centralizado de produtos.
 * Os dados ficam separados da estrutura HTML para facilitar manutenção.
 */

const products = [
  // Jogos - Casuais
  { id: 'chicken-run', name: 'Chicken Run: Commandodu', price: 107.99, image: 'img/chickenrun.png', type: 'jogo', category: 'casuais' },
  { id: 'moto-trials', name: 'MotoTrials', price: 39.99, image: 'img/mototrials.png', type: 'jogo', category: 'casuais' },
  { id: 'sonic-racing', name: 'Sonic Racing: CrossWorlds', price: 320.00, image: 'img/sonicracing.png', type: 'jogo', category: 'casuais' },
  { id: 'car-driving', name: 'Car Driving School Simulator', price: 57.99, image: 'img/cardriving.png', type: 'jogo', category: 'casuais' },

  // Jogos - Esportes
  { id: 'fc26', name: 'EA SPORTS FC™ 26', price: 299.00, image: 'img/eafc26.png', type: 'jogo', category: 'esportes' },
  { id: 'storror', name: 'STORROR Parkour Pro', price: 53.59, image: 'img/storror.png', type: 'jogo', category: 'esportes' },
  { id: 'rematch', name: 'REMATCH', price: 89.00, image: 'img/rematch.png', type: 'jogo', category: 'esportes' },
  { id: 'formula-legends', name: 'Formula Legends', price: 47.69, image: 'img/formulalegends.png', type: 'jogo', category: 'esportes' },

  // Jogos - Corrida
  { id: 'garfield-kart', name: 'Garfield Kart 2 - All You Can Drift', price: 107.99, image: 'img/garfieldkart.png', type: 'jogo', category: 'corrida' },
  { id: 'cyber-clutch', name: 'Cyber Clutch Hot Import Nights', price: 99.95, image: 'img/cyberclutch.png', type: 'jogo', category: 'corrida' },
  { id: 'wheel-world', name: 'Wheel World', price: 50.00, image: 'img/wheelworld.png', type: 'jogo', category: 'corrida' },

  // Jogos em destaque
  { id: 'gta-v', name: 'Grand Theft Auto V Enhanced', price: 149.90, image: 'img/gtaV.png', type: 'jogo', category: 'destaques' },
  { id: 'rdr2', name: 'Red Dead Redemption 2', price: 299.00, image: 'img/rdr2.png', type: 'jogo', category: 'destaques' },
  { id: 'alan-wake-2', name: 'Alan Wake 2', price: 225.00, image: 'img/alanwake2.png', type: 'jogo', category: 'destaques' },
  { id: 'cyberpunk-2077', name: 'Cyberpunk 2077', price: 199.90, image: 'img/cyberpunk.png', type: 'jogo', category: 'destaques' },
  { id: 'farming-simulator-25', name: 'Farming Simulator 25', price: 194.99, image: 'img/farm.png', type: 'jogo', category: 'destaques' },

  // Consoles - PlayStation
  { id: 'ps5-slim', name: 'PlayStation 5 Slim Edição Disk', price: 4799.00, image: 'img/play5.png', type: 'console', category: 'playstation' },
  { id: 'ps4-slim', name: 'PlayStation 4 Slim Edição Disk', price: 2000.00, image: 'img/ps4.png', type: 'console', category: 'playstation' },
  { id: 'ps3-slim', name: 'PlayStation 3 Slim Edição Disk', price: 1800.00, image: 'img/ps3.png', type: 'console', category: 'playstation' },

  // Consoles - Xbox
  { id: 'xbox-one', name: 'Xbox One', price: 1900.00, image: 'img/xboxone.png', type: 'console', category: 'xbox' },
  { id: 'xbox-series-s', name: 'Xbox Series S', price: 3400.00, image: 'img/xboxseriesS.png', type: 'console', category: 'xbox' },
  { id: 'xbox-series-x', name: 'Xbox Series X', price: 4000.00, image: 'img/xboxseriesX.png', type: 'console', category: 'xbox' },

  // Consoles - Nintendo
  { id: 'switch-oled', name: 'Nintendo Switch OLED', price: 2999.00, image: 'img/switchOLED.png', type: 'console', category: 'nintendo' },
  { id: 'switch-lite', name: 'Nintendo Switch Lite', price: 1499.00, image: 'img/switchlite.png', type: 'console', category: 'nintendo' },
  { id: 'switch-classic', name: 'Nintendo Switch Classic', price: 2499.00, image: 'img/switchclassic.png', type: 'console', category: 'nintendo' },

  // Acessórios - Headset
  { id: 'havit-h2002d', name: 'Havit Headphone H2002d Red', price: 200.00, image: 'img/havit.png', type: 'acessorio', category: 'headset' },
  { id: 'tgt-b33', name: 'Headset Gamer TGT B33 Rainbow', price: 190.00, image: 'img/tgtb33.png', type: 'acessorio', category: 'headset' },
  { id: 'mancer-crater-v2', name: 'Headset Gamer Mancer Crater V2 Rainbow', price: 250.00, image: 'img/mancer.png', type: 'acessorio', category: 'headset' },

  // Acessórios - Controle
  { id: 'xbox-electric-volt', name: 'Controle sem fio Xbox - Electric Volt', price: 150.00, image: 'img/xboxvolt.png', type: 'acessorio', category: 'controle' },
  { id: 'dualshock-4', name: 'Controle sem fio DualShock 4', price: 300.00, image: 'img/dualshock4.png', type: 'acessorio', category: 'controle' },
  { id: 'dualsense', name: 'Controle PS5 DualSense Clássico', price: 250.00, image: 'img/dualsense.png', type: 'acessorio', category: 'controle' },

  // Acessórios - VR
  { id: 'oculus-rift', name: 'Oculus Rift VR + Controle Touch', price: 8990.90, oldPrice: 9500.00, image: 'img/rift.png', type: 'acessorio', category: 'vr' },
  { id: 'vr-box', name: 'Óculos VR Box c/ Controle', price: 1242.65, image: 'img/vrbox.png', type: 'acessorio', category: 'vr' },
  { id: 'psvr2', name: 'PlayStation VR2 + Horizon', price: 3250.99, image: 'img/psvr2.png', type: 'acessorio', category: 'vr' },

  // Acessórios - Mouse
  { id: 'kanup-7200', name: 'Mouse Gamer RGB Colmeia 7200DPI Kanup', price: 249.99, image: 'img/kanup.png', type: 'acessorio', category: 'mouse' },
  { id: 'razer-deathadder', name: 'Mouse Razer DeathAdder Essential', price: 499.99, image: 'img/razer.png', type: 'acessorio', category: 'mouse' },
  { id: 'mouse-7d', name: 'Mouse Gamer 3200DPI USB 7D', price: 210.99, image: 'img/mouse7d.png', type: 'acessorio', category: 'mouse' }
];

const promotions = [
  { id: 'promo-ps5', name: 'Console PlayStation 5 Slim', price: 3799.90, oldPrice: 4799.00, image: 'img/ps5.png', type: 'promocao' },
  { id: 'promo-kit', name: 'Teclado e Mouse Gamer RGB', price: 139.90, oldPrice: 169.59, image: 'img/teclado.png', type: 'promocao' },
  { id: 'promo-jogos', name: 'Leve três jogos e ganhe 20% de desconto', image: 'img/3jogos.png', type: 'promocao' },
  { id: 'promo-vr', name: 'Oculus Rift VR', price: 8990.90, oldPrice: 9500.00, image: 'img/vr.png', type: 'promocao' }
];
