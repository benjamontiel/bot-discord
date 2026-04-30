const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = process.env.TOKEN;

const CHANNELS = {
  '1496570960994766948': '1496570869705740462',
  '1497236252641067129': '1497235868862382306'
};

let reuniones = {};

// ENTRADA / SALIDA VOZ
client.on('voiceStateUpdate', (oldState, newState) => {
  const canalEntrar = newState.channelId;
  const canalSalir = oldState.channelId;

  // ENTRA
  if (CHANNELS[canalEntrar]) {
    if (!reuniones[canalEntrar]) {
      reuniones[canalEntrar] = {
        inicio: new Date(),
        participantes: new Set()
      };
    }

    if (newState.member && !newState.member.user.bot) {
      reuniones[canalEntrar].participantes.add(newState.member.user.tag);
    }
  }

  // SALE
  if (CHANNELS[canalSalir]) {
    const canal = oldState.guild.channels.cache.get(canalSalir);

    if (canal && canal.members.size === 0 && reuniones[canalSalir]) {
      const reunion = reuniones[canalSalir];
      const fin = new Date();
      const duracion = Math.floor((fin - reunion.inicio) / 60000);

      const canalTextoID = CHANNELS[canalSalir];
      const canalTexto = oldState.guild.channels.cache.get(canalTextoID);

      if (canalTexto) {
        canalTexto.send(`📅 **Reunión finalizada**
🕒 Inicio: ${reunion.inicio.toLocaleString()}
⏱ Duración: ${duracion} minutos
👥 Participantes:
- ${[...reunion.participantes].join('\n- ')}`);
      }

      delete reuniones[canalSalir];
    }
  }
});

// READY EVENT
client.once('ready', () => {
  console.log(`Bot listo como ${client.user.tag}`);
});

// LOGIN
client.login(TOKEN);