import * as THREE from 'three';

/**
 * TextureGenerator
 * Produces crisp, memory-efficient canvas textures with proper mipmaps and caching.
 * Disposed automatically when textures are no longer needed.
 */
class TextureGenerator {
  private cache: Map<string, THREE.CanvasTexture> = new Map();

  public getWoodFloorTexture(): THREE.CanvasTexture {
    const key = 'wood_floor';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base rich warm wood
    ctx.fillStyle = '#4a2f1c';
    ctx.fillRect(0, 0, 512, 512);

    // Parquet planks
    const plankHeight = 64;
    for (let y = 0; y < 512; y += plankHeight) {
      const plankWidth = 128;
      const offset = (y / plankHeight) % 2 === 0 ? 0 : 64;
      for (let x = -64; x < 512 + 64; x += plankWidth) {
        const px = x + offset;
        // Subtle plank color variations
        const lightness = Math.floor(Math.random() * 18 - 9);
        ctx.fillStyle = `rgb(${74 + lightness}, ${47 + lightness * 0.7}, ${28 + lightness * 0.5})`;
        ctx.fillRect(px + 1, y + 1, plankWidth - 2, plankHeight - 2);

        // Wood grain lines
        ctx.strokeStyle = `rgba(35, 18, 10, ${0.15 + Math.random() * 0.15})`;
        ctx.lineWidth = 1;
        for (let g = 0; g < 6; g++) {
          const gy = y + 4 + Math.random() * (plankHeight - 8);
          ctx.beginPath();
          ctx.moveTo(px + 2, gy);
          ctx.bezierCurveTo(
            px + plankWidth * 0.3, gy + (Math.random() * 4 - 2),
            px + plankWidth * 0.7, gy + (Math.random() * 4 - 2),
            px + plankWidth - 2, gy
          );
          ctx.stroke();
        }
      }

      // Dark grout line between planks
      ctx.strokeStyle = '#1b1008';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;

    this.cache.set(key, texture);
    return texture;
  }

  public getVintageWallpaperTexture(): THREE.CanvasTexture {
    const key = 'vintage_wallpaper';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Muted 1990s sage-cream base
    ctx.fillStyle = '#cfc6b0';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle paper noise
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let i = 0; i < 2000; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // Vintage damask / floral stencil motif
    const tileSize = 128;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const cx = x + tileSize / 2;
        const cy = y + tileSize / 2;

        ctx.fillStyle = '#8f9a84'; // vintage sage green
        // Central flower bud
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        // Petals & flourishes
        ctx.strokeStyle = '#7c8872';
        ctx.lineWidth = 3;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const px = cx + Math.cos(a) * 24;
          const py = cy + Math.sin(a) * 24;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Diamond borders
        ctx.strokeStyle = 'rgba(120, 110, 90, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(x + tileSize, cy);
        ctx.lineTo(cx, y + tileSize);
        ctx.lineTo(x, cy);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Vintage vertical stripes
    ctx.fillStyle = 'rgba(100, 90, 70, 0.08)';
    for (let x = 0; x < 512; x += 32) {
      ctx.fillRect(x, 0, 12, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;

    this.cache.set(key, texture);
    return texture;
  }

  public getRugTexture(): THREE.CanvasTexture {
    const key = 'oriental_rug';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Deep crimson vintage rug
    ctx.fillStyle = '#6b1d1d';
    ctx.fillRect(0, 0, 512, 512);

    // Ornate gold & navy borders
    ctx.strokeStyle = '#c4974f';
    ctx.lineWidth = 16;
    ctx.strokeRect(20, 20, 472, 472);

    ctx.strokeStyle = '#1b2c45';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, 440, 440);

    // Medallion in center
    ctx.fillStyle = '#1b2c45';
    ctx.beginPath();
    ctx.ellipse(256, 256, 120, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#e6ba68';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Fringe on ends
    ctx.fillStyle = '#dfd6c5';
    ctx.fillRect(0, 0, 512, 8);
    ctx.fillRect(0, 504, 512, 8);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public getCrayonDrawingTexture(): THREE.CanvasTexture {
    const key = 'crayon_drawing';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Off-white construction paper
    ctx.fillStyle = '#f8f4eb';
    ctx.fillRect(0, 0, 512, 512);

    // Rough paper grain
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    for (let i = 0; i < 1500; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }

    // Sun in corner (childish)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(450, 60, 45, 0, Math.PI * 2);
    ctx.fill();

    // Red roof house
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(140, 240);
    ctx.lineTo(260, 140);
    ctx.lineTo(380, 240);
    ctx.closePath();
    ctx.fill();

    // Blue house body
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(160, 240, 200, 180);

    // Stick figures: Mommy, Daddy, Little Leo
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Daddy (tall green shirt)
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(70, 310, 30, 70);
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(85, 290, 16, 0, Math.PI * 2);
    ctx.fill();

    // Mommy (red dress)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(115, 380);
    ctx.lineTo(135, 320);
    ctx.lineTo(155, 380);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(135, 300, 15, 0, Math.PI * 2);
    ctx.fill();

    // Little Leo with teddy bear
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(170, 350, 22, 50);
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(181, 336, 12, 0, Math.PI * 2);
    ctx.fill();

    // Barnaby Bear (brown circle)
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(205, 360, 10, 0, Math.PI * 2);
    ctx.fill();

    // Ominous subtle shadow figure scribbled in black crayon hovering behind the window
    ctx.fillStyle = 'rgba(15, 15, 20, 0.75)';
    ctx.fillRect(235, 270, 45, 50);
    // Scribbled tall figure
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(430, 250);
    ctx.lineTo(430, 420);
    ctx.stroke();
    // Scribbled eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(425, 230, 5, 0, Math.PI * 2);
    ctx.arc(440, 230, 5, 0, Math.PI * 2);
    ctx.fill();

    // Handwritten childlike text
    ctx.font = '24px "Special Elite", cursive, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('OUR HAPPY HOME - 1998', 120, 470);
    ctx.font = '16px "Special Elite", cursive, sans-serif';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('(he is watching from the dark)', 130, 495);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public getFramedFamilyPortraitTexture(isGlitch: boolean = false): THREE.CanvasTexture {
    const key = isGlitch ? 'portrait_glitch' : 'portrait_normal';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Sepia vintage photo background
    ctx.fillStyle = isGlitch ? '#2a1215' : '#5a4632';
    ctx.fillRect(0, 0, 512, 512);

    // Vignette
    const grad = ctx.createRadialGradient(256, 256, 120, 256, 256, 320);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Oval gold frame border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(256, 256, 210, 230, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (!isGlitch) {
      // Warm nostalgic family silhouettes
      ctx.fillStyle = '#e8d8c3';
      // Father
      ctx.beginPath();
      ctx.ellipse(190, 230, 45, 65, 0, 0, Math.PI * 2);
      ctx.fill();
      // Mother
      ctx.beginPath();
      ctx.ellipse(320, 240, 42, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      // Child (Leo)
      ctx.beginPath();
      ctx.ellipse(256, 310, 36, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2d2218';
      ctx.font = '18px "Special Elite", cursive, serif';
      ctx.textAlign = 'center';
      ctx.fillText('The Vance Family, Summer 1996', 256, 450);
    } else {
      // Psychological glitch version: faces blurred/swirled, clinical numbers scribbled
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(190, 230, 45, 65, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(320, 240, 42, 60, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(256, 310, 40, 0, Math.PI * 2);
      ctx.fill();

      // Static noise lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 40; i++) {
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(460, y);
        ctx.stroke();
      }

      ctx.fillStyle = '#f87171';
      ctx.font = '22px "Special Elite", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DO NOT BELIEVE THEM', 256, 450);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public getCRTScreenTexture(state: 'static' | 'emergency' | 'clinical'): THREE.CanvasTexture {
    const key = `crt_${state}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    if (state === 'static') {
      // Black & white static noise
      const imgData = ctx.createImageData(512, 384);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);

      // Channel label
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('CH 03 - VCR', 40, 60);
    } else if (state === 'emergency') {
      // Severe Weather Alert / Emergency Broadcast
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 512, 384);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 0, 512, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px monospace';
      ctx.fillText('EMERGENCY BROADCAST', 90, 42);

      ctx.font = '18px monospace';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('SEVERE STORM WARNING IN COUNTY', 40, 130);
      ctx.fillText('ALL RESIDENTS ARE URGED TO STAY', 40, 170);
      ctx.fillText('INDOORS. POWER FLUCTUATIONS REPORTED.', 40, 210);

      ctx.font = '16px monospace';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('TIME: 03:17:42 AM', 40, 320);
    } else {
      // Act 3 Clinical dream leak: Patient EEG & Vital telemetry
      ctx.fillStyle = '#050c18';
      ctx.fillRect(0, 0, 512, 384);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('ST. JUDE PEDIATRIC - NEUROLOGY ICU', 30, 40);

      ctx.fillStyle = '#4ade80';
      ctx.font = '16px monospace';
      ctx.fillText('PATIENT: VANCE, LEO  |  AGE: 9', 30, 80);
      ctx.fillText('STATUS: COMATOSE / PERSISTENT REM', 30, 110);

      // Simulated ECG green line
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      let y = 200;
      for (let x = 30; x < 480; x += 15) {
        if ((x > 180 && x < 210) || (x > 360 && x < 390)) {
          y = 200 + ((x % 30) - 15) * 4;
        } else {
          y = 200 + (Math.random() * 6 - 3);
        }
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('BPM: 74  |  SPO2: 98%  |  SEDATED', 30, 290);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'italic 16px sans-serif';
      ctx.fillText('"Wake up, Leo... Can you hear my voice?"', 40, 350);
    }

    // CRT scanlines overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    for (let y = 0; y < 384; y += 3) {
      ctx.fillRect(0, y, 512, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public getHospitalTileTexture(): THREE.CanvasTexture {
    const key = 'hospital_tiles';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Sterile greenish-white hospital vinyl floor tiles
    ctx.fillStyle = '#dbe7e4';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;

    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        // Tile speckles
        ctx.fillStyle = 'rgba(75, 85, 99, 0.08)';
        for (let s = 0; s < 12; s++) {
          ctx.fillRect(x + Math.random() * tileSize, y + Math.random() * tileSize, 2, 2);
        }
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;

    this.cache.set(key, texture);
    return texture;
  }

  public getMedicalClipboardTexture(): THREE.CanvasTexture {
    const key = 'medical_clipboard';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Brown masonite clipboard background
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, 0, 512, 512);

    // Silver metal clip at top
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(156, 10, 200, 45);
    ctx.fillStyle = '#475569';
    ctx.fillRect(230, 20, 52, 20);

    // Paper sheet
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(35, 45, 442, 440);

    // Hospital header
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('DEPARTMENT OF CHILD PSYCHIATRY', 55, 85);

    ctx.font = '13px monospace';
    ctx.fillText('CLINICAL ADMISSION & PSYCH EVALUATION', 55, 110);
    ctx.fillText('----------------------------------------------------', 55, 125);

    ctx.fillStyle = '#0f172a';
    ctx.font = '14px sans-serif';
    ctx.fillText('Patient Name: Vance, Leo', 55, 150);
    ctx.fillText('Age: 9 years, 4 months     Room: 412-B', 55, 175);
    ctx.fillText('Primary Physician: Dr. K. Harmon, MD', 55, 200);

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Diagnosis: Pediatric Early-Onset Schizophrenia', 55, 235);
    ctx.fillText('Current Status: Severe Auditory & Visual Hallucinations', 55, 260);

    ctx.fillStyle = '#334155';
    ctx.font = 'italic 12px serif';
    ctx.fillText('Physician Notes:', 55, 290);
    ctx.fillText('"Subject exhibits deep detachment from clinical reality.', 55, 312);
    ctx.fillText('During episodes, he repeatedly retreats into a vivid,', 55, 332);
    ctx.fillText('cyclical dream of his childhood family home on Elmridge.', 55, 352);
    ctx.fillText('He searches for his parents, unaware that his mind', 55, 372);
    ctx.fillText('created the monsters as manifestations of his illness."', 55, 392);

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Rx: Haloperidol 2mg IV, Lorazepam 1mg PRN', 55, 430);

    // Doctor signature stamp
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.strokeRect(330, 420, 130, 45);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('HOSPITAL RECORD', 336, 445);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public getBathroomTileTexture(): THREE.CanvasTexture {
    const key = 'bathroom_hex_tiles';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Vintage black & white mosaic octagon tile pattern with aged grout
    ctx.fillStyle = '#20232a'; // dark aged grout
    ctx.fillRect(0, 0, 512, 512);

    const size = 32;
    for (let y = 0; y < 512; y += size) {
      for (let x = 0; x < 512; x += size) {
        const isBlackDot = (x / size + y / size) % 2 === 0;

        if (isBlackDot) {
          // Small black diamond / square dot in corner
          ctx.fillStyle = '#111827';
          ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        } else {
          // White octagonal ceramic tile with subtle ceramic glaze gradient
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          const r = (size - 4) / 2;
          const cx = x + size / 2;
          const cy = y + size / 2;
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          // Subtle water drop / discoloration stain
          if (Math.random() > 0.7) {
            ctx.fillStyle = 'rgba(120, 113, 108, 0.12)';
            ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
          }
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  public getFloralWallpaperTexture(): THREE.CanvasTexture {
    const key = 'floral_master_wallpaper';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Faded vintage Victorian burgundy & dusty rose damask
    ctx.fillStyle = '#451a23';
    ctx.fillRect(0, 0, 512, 512);

    // Fine paper grain and watermark aging
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let i = 0; i < 3000; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    const cell = 128;
    for (let y = 0; y < 512; y += cell) {
      for (let x = 0; x < 512; x += cell) {
        const cx = x + cell / 2;
        const cy = y + cell / 2;

        // Vintage gold / dusty pink damask floral bouquet
        ctx.fillStyle = '#9f5869';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 8, 16, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b77383';
        ctx.beginPath();
        ctx.ellipse(cx - 14, cy + 6, 12, 18, -0.4, 0, Math.PI * 2);
        ctx.ellipse(cx + 14, cy + 6, 12, 18, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Acanthus leaf flourishes
        ctx.strokeStyle = '#c4975f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx - 24, cy - 10, 18, 0, Math.PI);
        ctx.arc(cx + 24, cy - 10, 18, 0, Math.PI);
        ctx.stroke();

        // Diamond trellis
        ctx.strokeStyle = 'rgba(196, 151, 95, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(x + cell, cy);
        ctx.lineTo(cx, y + cell);
        ctx.lineTo(x, cy);
        ctx.closePath();
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 3);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  public getKitchenLinoleumTexture(): THREE.CanvasTexture {
    const key = 'kitchen_linoleum';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 1980s checkered linoleum (creamy ochre and muted moss olive)
    const tileSize = 64;
    for (let y = 0; y < 512; y += tileSize) {
      for (let x = 0; x < 512; x += tileSize) {
        const isAlt = (x / tileSize + y / tileSize) % 2 === 0;
        ctx.fillStyle = isAlt ? '#e8dcc4' : '#475440';
        ctx.fillRect(x, y, tileSize, tileSize);

        // Faint scuffs & wax polish sheen
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        ctx.strokeStyle = '#293225';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  public getPeelingPlasterTexture(): THREE.CanvasTexture {
    const key = 'peeling_plaster';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dingy aged plaster base
    ctx.fillStyle = '#b8b09d';
    ctx.fillRect(0, 0, 512, 512);

    // Water stains and mottled discolorations
    for (let i = 0; i < 20; i++) {
      const grad = ctx.createRadialGradient(
        Math.random() * 512, Math.random() * 512, 10,
        Math.random() * 512, Math.random() * 512, 140
      );
      grad.addColorStop(0, 'rgba(100, 80, 50, 0.25)');
      grad.addColorStop(1, 'rgba(100, 80, 50, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
    }

    // Cracks in plaster exposing rough lath
    ctx.strokeStyle = '#3e3529';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 0);
    ctx.lineTo(150, 80);
    ctx.lineTo(135, 170);
    ctx.lineTo(180, 240);
    ctx.lineTo(165, 380);
    ctx.lineTo(210, 512);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  public getBookshelfTexture(): THREE.CanvasTexture {
    const key = 'bookshelf_spines';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark oak wood backing
    ctx.fillStyle = '#26170d';
    ctx.fillRect(0, 0, 512, 512);

    const shelfHeight = 128;
    const bookColors = [
      '#6b2121', '#1e3a5f', '#1e4d2b', '#854d0e', '#3f3f46', '#7c2d12', '#312e81',
    ];

    for (let y = 0; y < 512; y += shelfHeight) {
      // Wood shelf divider
      ctx.fillStyle = '#4a2f1c';
      ctx.fillRect(0, y + shelfHeight - 14, 512, 14);
      ctx.fillStyle = '#1a0f07';
      ctx.fillRect(0, y + shelfHeight - 2, 512, 2);

      let x = 12;
      while (x < 500) {
        const bookWidth = 14 + Math.floor(Math.random() * 20);
        const bookHeight = shelfHeight - 20 - Math.floor(Math.random() * 16);
        const color = bookColors[Math.floor(Math.random() * bookColors.length)];

        ctx.fillStyle = color;
        ctx.fillRect(x, y + shelfHeight - 14 - bookHeight, bookWidth, bookHeight);

        // Gold embossed ribs / title on spine
        ctx.fillStyle = '#eab308';
        ctx.fillRect(x + 2, y + shelfHeight - 14 - bookHeight + 12, bookWidth - 4, 3);
        ctx.fillRect(x + 2, y + shelfHeight - 14 - bookHeight + 20, bookWidth - 4, 2);
        ctx.fillRect(x + 2, y + shelfHeight - 26, bookWidth - 4, 3);

        x += bookWidth + 3;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public getFoggedMirrorTexture(isUncanny: boolean = false): THREE.CanvasTexture {
    const key = isUncanny ? 'mirror_uncanny' : 'mirror_normal';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Fogged steamy mirror surface (frosty silver)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 512, 512);

    // Heavy steam condensation vignette
    const grad = ctx.createRadialGradient(256, 256, 80, 256, 256, 250);
    grad.addColorStop(0, 'rgba(241, 245, 249, 0.85)');
    grad.addColorStop(1, 'rgba(148, 163, 184, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Condensation water drips running down the glass
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
    ctx.lineWidth = 2.5;
    for (let d = 0; d < 14; d++) {
      const dx = 40 + Math.random() * 432;
      const startY = 80 + Math.random() * 120;
      ctx.beginPath();
      ctx.moveTo(dx, startY);
      ctx.lineTo(dx + (Math.random() * 6 - 3), startY + 120 + Math.random() * 160);
      ctx.stroke();
    }

    if (isUncanny) {
      // Finger-traced chilling message through steam
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.font = 'bold 44px "Special Elite", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('W A K E   U P', 256, 230);
      ctx.font = 'bold 28px "Special Elite", monospace, sans-serif';
      ctx.fillStyle = '#7f1d1d';
      ctx.fillText('LEO, THIS IS A MEMORY', 256, 290);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public getBrickFireplaceTexture(): THREE.CanvasTexture {
    const key = 'brick_fireplace';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Mortar base
    ctx.fillStyle = '#78716c';
    ctx.fillRect(0, 0, 512, 512);

    const bH = 32;
    const bW = 64;
    for (let y = 0; y < 512; y += bH) {
      const offset = (y / bH) % 2 === 0 ? 0 : 32;
      for (let x = -32; x < 512 + 32; x += bW) {
        const px = x + offset;
        const tone = Math.floor(Math.random() * 26);
        ctx.fillStyle = `rgb(${155 + tone}, ${52 + tone * 0.4}, ${36 + tone * 0.3})`;
        ctx.fillRect(px + 2, y + 2, bW - 4, bH - 4);
      }
    }

    // Soot darkening gradient at center & top
    const sootGrad = ctx.createLinearGradient(0, 512, 0, 150);
    sootGrad.addColorStop(0, 'rgba(15, 15, 18, 0.85)');
    sootGrad.addColorStop(1, 'rgba(15, 15, 18, 0.0)');
    ctx.fillStyle = sootGrad;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    this.cache.set(key, texture);
    return texture;
  }

  public getFuseBoxTexture(): THREE.CanvasTexture {
    const key = 'fuse_box_panel';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Industrial tarnished metal enclosure
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);

    // Warning hazard stripes at top
    for (let x = 0; x < 512; x += 40) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 20, 0);
      ctx.lineTo(x - 10, 40);
      ctx.lineTo(x - 30, 40);
      ctx.closePath();
      ctx.fill();
    }

    // Recessed panel
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 60, 432, 400);

    // Circuit breakers
    const breakers = [
      { name: 'MAIN HOUSE 120V', state: 'ON', color: '#22c55e' },
      { name: 'BEDROOM / HALL', state: 'ON', color: '#22c55e' },
      { name: 'KITCHEN / UTILITY', state: 'TRIPPED', color: '#ef4444' },
      { name: 'LIVING ROOM / CRT', state: 'ON', color: '#22c55e' },
      { name: 'BASEMENT CELLAR', state: 'OFF', color: '#94a3b8' },
      { name: 'ST. JUDE ICU 412', state: 'CRITICAL', color: '#f97316' },
    ];

    breakers.forEach((b, idx) => {
      const by = 85 + idx * 58;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(60, by, 392, 46);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(b.name, 75, by + 28);

      // Switch toggle
      ctx.fillStyle = b.color;
      ctx.fillRect(360, by + 10, 70, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(b.state, 370, by + 28);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public getCalendarTexture(): THREE.CanvasTexture {
    const key = 'vintage_calendar';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Yellowed paper calendar
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, 512, 512);

    // Top banner (Autumn Landscape photo mock)
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(20, 20, 472, 140);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('OCTOBER 1998', 256, 80);
    ctx.font = 'italic 16px serif';
    ctx.fillText('Elmridge Valley Community Calendar', 256, 120);

    // Calendar grid
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    days.forEach((d, i) => {
      ctx.fillText(d, 40 + i * 65, 190);
    });

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 205, 472, 280);

    // Dates
    let dayNum = 1;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 && c < 4) continue; // Oct 1 started on Thursday
        if (dayNum > 31) break;

        const dx = 40 + c * 65;
        const dy = 235 + r * 52;
        ctx.fillStyle = '#334155';
        ctx.font = '16px sans-serif';
        ctx.fillText(dayNum.toString(), dx, dy);

        // October 14 is heavily circled in red with handwritten note
        if (dayNum === 14) {
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(dx + 5, dy - 5, 26, 18, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#b91c1c';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('LEO ICU ADMISSION', dx - 20, dy + 18);
        }

        dayNum++;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public getTypewriterPaperTexture(): THREE.CanvasTexture {
    const key = 'typewriter_paper';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Aged yellow paper
    ctx.fillStyle = '#faf5e4';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#1c1917';
    ctx.font = '16px "Courier New", monospace';

    const lines = [
      'OBSERVATION RECORD #089',
      'DATE: OCTOBER 28, 1998',
      'SUBJECT: LEO VANCE (9 YRS)',
      '----------------------------------------',
      '',
      'The subject remains unresponsive to external',
      'stimuli. Neurological readings confirm he is',
      'wandering an identical mental facsimile of the',
      'family home.',
      '',
      'He believes the storm outside is preventing him',
      'from finding his mother and father. Every night,',
      'the illusion resets at 3:17 AM.',
      '',
      'If he can collect the five anchor memories,',
      'his subconscious will break the cycle and unlock',
      'the cellar door leading back to consciousness.',
      '',
      'Dr. K. Harmon -- Attending Neurologist',
    ];

    lines.forEach((line, i) => {
      ctx.fillText(line, 40, 60 + i * 22);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  public dispose() {
    this.cache.forEach((texture) => texture.dispose());
    this.cache.clear();
  }
}

export const textureGenerator = new TextureGenerator();
