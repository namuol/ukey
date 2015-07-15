import teoria from 'teoria';

export default function transposeChord ({chord, semitones}) {
  if (typeof chord === 'string') {
    chord = teoria.chord(chord);
  }

  const symbols = chord.symbol.split('/');
  let symbol = chord.symbol;

  if (symbols.length === 2 && symbols[1].trim() !== '9') {
    let note = teoria.note.fromKey(teoria.note(symbols[1].trim()).key() + semitones);
    symbol = symbols[0] + '/' + note.name().toUpperCase() + note.accidental();
  }

  return teoria.note.fromKey(chord.root.key() + semitones).chord(symbol);
}

window.transposeChord = transposeChord;
