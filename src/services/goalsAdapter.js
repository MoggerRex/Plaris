/**
 * Convierte la meta guardada en el perfil al formato que usan los formularios.
 *
 * Forma de una meta (montos en CENTAVOS, como usa MoneyInput):
 *   { id, name, cost, deadlineDays, currentSaving, protectedReserve }
 *
 * AJUSTA los nombres de la derecha (profile.goalCost, etc.) a los campos reales de tu perfil.
 * Si tu perfil guarda pesos y no centavos, multiplica por 100 aquí.
 */
export function profileToGoals(profile) {
  if (!profile?.goalName) return [];
  return [
    {
      id: 'profile-goal',
      name: profile.goalName,
      cost: profile.goalCost ?? 0,
      deadlineDays: profile.goalDays ?? 90,
      currentSaving: profile.currentSavings ?? 0,
      protectedReserve: profile.protectedReserve ?? 0,
    },
  ];
}