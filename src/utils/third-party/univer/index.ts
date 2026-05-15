export async function importUniver() {
  return await Promise.all([
    import('@univerjs/presets'),
  ]);
}

export default importUniver;