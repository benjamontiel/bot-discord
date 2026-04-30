const TOKEN = process.env.TOKEN;
const CHANNELS = {
  '1496570960994766948': '1496570869705740462',
  '1497236252641067129': '1497235868862382306'
};
let reuniones = {};

client.on('voiceStateUpdate', (oldState, newState) => {
  const canalEntrar = newState.channelId;
  const canalSalir = oldState.channelId;

  // ENTRA a un canal monitoreado
  if (CHANNELS[canalEntrar]) {
    if (!reuniones[canalEntrar]) {
      reuniones[canalEntrar] = {
        inicio: new Date(),
        participantes: new Set()
      };
    }

    reuniones[canalEntrar].participantes.add(newState.member.user.tag);
  }

  // SALE de un canal monitoreado
  if (CHANNELS[canalSalir]) {
    const canal = oldState.guild.channels.cache.get(canalSalir);

    if (canal.members.size === 0 && reuniones[canalSalir]) {
      const reunion = reuniones[canalSalir];
      const fin = new Date();
      const duracion = Math.floor((fin - reunion.inicio) / 60000);

      const canalTextoID = CHANNELS[canalSalir];
      const canalTexto = oldState.guild.channels.cache.get(canalTextoID);

      canalTexto.send(`📅 **Reunión finalizada**
🕒 Inicio: ${reunion.inicio.toLocaleString()}
⏱ Duración: ${duracion} minutos
👥 Participantes:
- ${[...reunion.participantes].join('\n- ')}`);

      delete reuniones[canalSalir];
    }
  }
});