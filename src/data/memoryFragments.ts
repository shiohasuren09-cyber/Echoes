import { MemoryFragment } from '../types';

/**
 * Procedurally generates high-resolution canvas visuals for each memory fragment
 */
function createWristbandImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // Dark slate background with medical grid lines
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, 600, 360);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 600; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 360);
    ctx.stroke();
  }
  for (let y = 0; y < 360; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }

  // The curved plastic wristband
  ctx.save();
  ctx.translate(300, 180);
  ctx.rotate(-0.06);

  // Band shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(-260, -38, 520, 84);

  // Band vinyl body (translucent medical white/cyan with worn edges)
  const bandGrad = ctx.createLinearGradient(0, -40, 0, 40);
  bandGrad.addColorStop(0, '#e2e8f0');
  bandGrad.addColorStop(0.5, '#f8fafc');
  bandGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = bandGrad;
  ctx.fillRect(-250, -40, 500, 80);

  // Plastic fastener clasp on left
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.roundRect(-240, -32, 28, 64, 4);
  ctx.fill();
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(-226, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  // Red Cross / St. Jude Medical Emblem
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-195, -22, 22, 6);
  ctx.fillRect(-187, -30, 6, 22);

  // Barcode
  ctx.fillStyle = '#0f172a';
  const barcodeX = -150;
  for (let b = 0; b < 100; b += 4) {
    const w = (b % 12 === 0 || b % 8 === 0) ? 3 : 1.5;
    ctx.fillRect(barcodeX + b, -28, w, 32);
  }
  ctx.font = '10px monospace';
  ctx.fillText('*4289-98-VANCE*', barcodeX, 14);

  // Patient Info Printed
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillText('VANCE, LEO   (M/09)', -30, -18);
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('MRN: 8849-0192   DOB: 04/12/1989', -30, 0);
  ctx.fillText('WARD: PEDIATRIC ICU - BED 412', -30, 18);
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText('ALLERGY: PENICILLIN / PROPOFOL', -30, 32);

  // Faint dried watermark / saline stain
  ctx.fillStyle = 'rgba(180, 83, 9, 0.08)';
  ctx.beginPath();
  ctx.arc(160, 5, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // CRT / Polaroid scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let i = 0; i < 360; i += 3) {
    ctx.fillRect(0, i, 600, 1);
  }

  return canvas.toDataURL('image/png');
}

function createCassetteImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#08090d';
  ctx.fillRect(0, 0, 600, 360);

  ctx.save();
  ctx.translate(300, 180);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath();
  ctx.roundRect(-210, -130, 420, 260, 16);
  ctx.fill();

  // Cassette Plastic Shell
  const shellGrad = ctx.createLinearGradient(0, -120, 0, 120);
  shellGrad.addColorStop(0, '#27272a');
  shellGrad.addColorStop(0.5, '#18181b');
  shellGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.roundRect(-200, -120, 400, 240, 12);
  ctx.fill();
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Label paper sticker
  ctx.fillStyle = '#f5f5f4';
  ctx.fillRect(-170, -100, 340, 110);
  ctx.strokeStyle = '#e4e4e7';
  ctx.strokeRect(-170, -100, 340, 110);

  // Red label line
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(-170, -96, 340, 4);

  // Handwritten note on label
  ctx.fillStyle = '#18181b';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText('ST. JUDE PEDIATRICS • CLINICAL PSYCH', -155, -78);
  ctx.font = 'italic 16px "Brush Script MT", cursive, sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('Session 03 - Leo V. (Night Terrors & Remission)', -155, -55);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#52525b';
  ctx.fillText('SIDE A • 15 MIN • SPEED 2.4 CM/S • OCT 1998', -155, -34);
  ctx.fillText('OBSERVER: DR. C. ARIS, MD', -155, -18);

  // Tape spool window (cutout)
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.roundRect(-120, 18, 240, 75, 8);
  ctx.fill();
  ctx.strokeStyle = '#3f3f46';
  ctx.stroke();

  // Spools (Left and Right)
  const drawSpool = (sx: number) => {
    // Tape pack
    ctx.fillStyle = '#451a03'; // brown magnetic tape
    ctx.beginPath();
    ctx.arc(sx, 55, 30, 0, Math.PI * 2);
    ctx.fill();

    // White geared center
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(sx, 55, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(sx, 55, 7, 0, Math.PI * 2);
    ctx.fill();

    // Gear teeth
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    for (let t = 0; t < 6; t++) {
      const ang = (t * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(ang) * 7, 55 + Math.sin(ang) * 7);
      ctx.lineTo(sx + Math.cos(ang) * 14, 55 + Math.sin(ang) * 14);
      ctx.stroke();
    }
  };

  drawSpool(-60);
  drawSpool(60);

  // Connecting tape ribbon
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-60, 72, 120, 8);

  ctx.restore();

  // Vintage dust & scanlines
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < 600; i++) {
    ctx.fillRect(Math.random() * 600, Math.random() * 360, 1.5, 1.5);
  }

  return canvas.toDataURL('image/png');
}

function createPrescriptionImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, 600, 360);

  ctx.save();
  ctx.translate(300, 180);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath();
  ctx.ellipse(0, 110, 110, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Amber Bottle Body (Translucent gradient)
  const amberGrad = ctx.createLinearGradient(-80, 0, 80, 0);
  amberGrad.addColorStop(0, 'rgba(180, 83, 9, 0.95)');
  amberGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.9)');
  amberGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.95)');
  amberGrad.addColorStop(1, 'rgba(146, 64, 14, 0.95)');

  ctx.fillStyle = amberGrad;
  ctx.beginPath();
  ctx.roundRect(-80, -90, 160, 200, [6, 6, 16, 16]);
  ctx.fill();

  // White Childproof Cap
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(-75, -125, 150, 35, 4);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cap ridges
  ctx.fillStyle = '#94a3b8';
  for (let r = -70; r < 70; r += 7) {
    ctx.fillRect(r, -125, 2, 35);
  }

  // Pharmacy Label on Bottle
  ctx.fillStyle = '#fefce8';
  ctx.fillRect(-70, -60, 140, 145);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(-70, -60, 140, 145);

  // Label Header
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(-70, -60, 140, 22);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('ST. JUDE PHARMACY RX', -65, -45);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('Rx #99281-04  DATE: 10/14/98', -65, -25);
  ctx.fillText('PATIENT: LEO VANCE (9)', -65, -12);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('HALOPERIDOL 1MG TAB', -65, 8);
  ctx.fillText('PROMETHAZINE 12.5MG', -65, 22);

  ctx.fillStyle = '#334155';
  ctx.font = '8px monospace';
  ctx.fillText('TAKE 1 TABLET AT 8:00 PM', -65, 40);
  ctx.fillText('WARNING: SUPPRESSES VIVID', -65, 52);
  ctx.fillText('HYPNAGOGIC HALLUCINATIONS', -65, 64);
  ctx.fillText('REF: DR. C. ARIS', -65, 78);

  ctx.restore();

  // Vignette overlay
  const vig = ctx.createRadialGradient(300, 180, 100, 300, 180, 300);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 600, 360);

  return canvas.toDataURL('image/png');
}

function createSoldierImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, 600, 360);

  ctx.save();
  ctx.translate(300, 180);

  // Soft glow
  const glow = ctx.createRadialGradient(0, 0, 20, 0, 0, 160);
  glow.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(-200, -150, 400, 300);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.ellipse(0, 120, 70, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Green circular toy pedestal
  ctx.fillStyle = '#1e3a1e';
  ctx.beginPath();
  ctx.ellipse(0, 115, 60, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soldier Boots & Legs
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-22, 60, 18, 55);
  ctx.fillRect(4, 60, 18, 55);

  // Trousers (Navy)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-24, 25, 20, 40);
  ctx.fillRect(4, 25, 20, 40);

  // Red Tunic / Uniform Torso
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(-30, -50, 60, 78);

  // Belt
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-30, 18, 60, 8);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-8, 16, 16, 12);

  // SURGICAL GAUZE WRAPPINGS around torso and left arm
  ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
  // Diagonal gauze wraps
  for (let g = -35; g < 15; g += 14) {
    ctx.save();
    ctx.translate(0, g);
    ctx.rotate(-0.25);
    ctx.fillRect(-35, 0, 70, 9);
    // Medical cloth weave texture
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-35, 0, 70, 9);
    ctx.restore();
  }

  // Left Arm in a miniature surgical splint with micropore tape
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-45, -30, 14, 65);
  // Handwritten scribbled text on tape
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('BRAVE', -43, -5);

  // Head and Bearskin Shako Hat
  ctx.fillStyle = '#fbcfe8'; // porcelain skin
  ctx.beginPath();
  ctx.arc(0, -65, 15, 0, Math.PI * 2);
  ctx.fill();

  // Hat
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(-16, -115, 32, 50, [6, 6, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(0, -90, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Caption at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = 'italic 12px serif';
  ctx.textAlign = 'center';
  ctx.fillText('"Soldiers don\'t flinch during the blood draw."', 300, 335);

  return canvas.toDataURL('image/png');
}

function createPolaroidImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#06070a';
  ctx.fillRect(0, 0, 600, 360);

  ctx.save();
  ctx.translate(300, 180);
  ctx.rotate(0.04);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(-145, -165, 290, 330);

  // White Polaroid Cardboard border
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-140, -160, 280, 320);

  // Photo Area
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-120, -145, 240, 220);

  // Inner Image: Living Room fireplace overlaid with glitching hospital reflection
  const livingRoomGrad = ctx.createLinearGradient(0, -145, 0, 75);
  livingRoomGrad.addColorStop(0, '#292524');
  livingRoomGrad.addColorStop(0.5, '#44403c');
  livingRoomGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = livingRoomGrad;
  ctx.fillRect(-120, -145, 240, 220);

  // Fireplace warm glow
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(0, 20, 35, 0, Math.PI * 2);
  ctx.fill();

  // GLITCH SPLIT: The bottom half / mirror reflection reveals hospital IV pole and curtains
  ctx.save();
  ctx.beginPath();
  ctx.rect(-120, -60, 240, 135);
  ctx.clip();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-120, -60, 240, 135);

  // Chrome IV stand silhouette
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(35, -40);
  ctx.lineTo(35, 75);
  ctx.stroke();

  // Hanging saline drip bag
  ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.fillRect(20, -55, 14, 24);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, -55, 14, 24);

  // Hospital curtain pleats
  ctx.fillStyle = '#1e293b';
  for (let c = -110; c < -10; c += 20) {
    ctx.fillRect(c, -60, 16, 135);
  }

  // Two bowed figures at bedside
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(-20, 20, 12, 0, Math.PI * 2);
  ctx.arc(-50, 25, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Digital Glitch / Tear line between two realities
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-120, -62, 240, 3);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-115, -60, 180, 1.5);

  // Handwritten note on Polaroid bottom margin
  ctx.fillStyle = '#1e293b';
  ctx.font = 'italic 16px "Brush Script MT", cursive, sans-serif';
  ctx.fillText("Elmridge Living Room • Dec '97", -90, 110);
  ctx.font = '10px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('WHY IS THE BED IN THE PARLOR?', -90, 135);

  ctx.restore();

  return canvas.toDataURL('image/png');
}

export const MEMORY_FRAGMENTS: MemoryFragment[] = [
  {
    id: 'fragment_wristband',
    number: 1,
    title: 'The Plastic Band',
    artifactName: 'Pediatric Admission Wristband',
    locationHint: "Curled beside the windowsill in Leo's bedroom.",
    narrative:
      "A torn plastic band you swore was a silver festival bracelet. Stamped into the vinyl is a room number: '412 - Pediatric Observation'. A knot forms in your stomach—you've never been to a festival. The vinyl smells faintly of isopropyl alcohol and fresh bandages.",
    subtext: 'A distant memory of cold metal bed rails and fluorescent lights humming above your pillow.',
    audioType: 'telemetry_ventilator',
    audioTitle: 'Echo 01: Ventilator Rhythm & Far Telemetry',
    imageDataUri: createWristbandImage(),
    dateTag: 'OCT 12, 1998 • 01:14 AM',
    iconType: 'wristband',
  },
  {
    id: 'fragment_cassette',
    number: 2,
    title: 'The Spooled Tape',
    artifactName: "Dictaphone Tape 'Session 03'",
    locationHint: 'Resting on the side table beside the ticking pendulum clock.',
    narrative:
      "Tucked beside the grandfather clock on the hall table. It’s an audio cassette meant for a doctor's pocket recorder, not your boombox. In the magnetic hum, a calm, tired voice speaks through tape hiss: 'The boy constructs the house in vivid detail whenever the fever spikes. He believes he is looking for something lost in the dark. We must keep him stable until morning.'",
    subtext: 'The voice feels so close, as though someone is whispering right behind your left ear.',
    audioType: 'cassette_recording',
    audioTitle: 'Echo 02: Dictaphone Warble & Dr. Aris',
    imageDataUri: createCassetteImage(),
    dateTag: 'OCT 14, 1998 • 03:45 AM',
    iconType: 'cassette',
  },
  {
    id: 'fragment_prescription',
    number: 3,
    title: 'The Amber Bottle',
    artifactName: 'Empty Prescription Vial',
    locationHint: 'Placed beside the sink on the kitchen counter.',
    narrative:
      "Sitting on the kitchen counter beside a cup of water that never evaporates. The label is typed on an electric typewriter: 'For suppression of acute nocturnal psychoses and febrile hallucinations. Keep away from bright light.' Mommy told you these were vitamins that would make your chest stop hurting. But every time you swallowed one, the wallpaper patterns stopped breathing for an hour.",
    subtext: 'The sound of pills rattling softly in plastic, like rain on a hospital windowpane.',
    audioType: 'pill_whisper',
    audioTitle: 'Echo 03: Pill Rattle & Muffled Prayers',
    imageDataUri: createPrescriptionImage(),
    dateTag: 'OCT 15, 1998 • 11:20 PM',
    iconType: 'prescription',
  },
  {
    id: 'fragment_soldier',
    number: 4,
    title: 'The Wounded Soldier',
    artifactName: 'Gauze-Wrapped Tin Soldier',
    locationHint: 'Hidden beneath the armchair in the living room.',
    narrative:
      "Hidden beneath the living room armchair. His tin rifle is intact, but his chest and arm are carefully wrapped in sterile medical gauze tape, held by a tiny butterfly bandage. You remember doing this on a Tuesday afternoon when the doctor with the gentle eyes told you that bravery means keeping your arm still when the needle pinches. You told the soldier he was the bravest boy in the ward.",
    subtext: 'A faint nursery lullaby plays backwards through the floorboards.',
    audioType: 'warped_lullaby',
    audioTitle: 'Echo 04: Reverse Music Box & Minor Lullaby',
    imageDataUri: createSoldierImage(),
    dateTag: 'OCT 16, 1998 • 04:30 AM',
    iconType: 'soldier',
  },
  {
    id: 'fragment_polaroid',
    number: 5,
    title: 'The Mirrored Image',
    artifactName: 'Distorted Polaroid Snapshot',
    locationHint: 'Resting upon the living room bookshelf near the fireplace.',
    narrative:
      "An instant photograph resting on the bookshelf. At first glance, it shows Elmridge living room with the warm lamp glowing. But as you tilt the gloss against your flashlight beam, the reflection in the dark glass window doesn't show the backyard trees. It shows a sterile white room, an IV bag dripping steadily, and two figures sitting in plastic chairs with their heads in their hands, weeping silently.",
    subtext: 'A tear in the fabric of the dream. The waking world is reaching through.',
    audioType: 'polaroid_shutter',
    audioTitle: 'Echo 05: Shutter Click & Waking Whisper',
    imageDataUri: createPolaroidImage(),
    dateTag: 'OCT 17, 1998 • 06:05 AM',
    iconType: 'polaroid',
  },
];

export function getMemoryFragment(id: string): MemoryFragment | undefined {
  return MEMORY_FRAGMENTS.find((f) => f.id === id);
}
