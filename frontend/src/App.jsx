import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { VolumeX, Volume2, Menu, ArrowRight, Play, Music, SkipBack, SkipForward, Volume1, X, Film, Pause, Globe } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorDotPos, setCursorDotPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [ambientActive, setAmbientActive] = useState(false);
  const [volume, setVolume] = useState(100);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [playingVideoIndex, setPlayingVideoIndex] = useState(null);

  const quotes = [
    { text: '<span class="em">Great men</span> are not born great, they grow great through the passage of time and the weight of their <span class="em">choices</span>.', attr: '&mdash; Mario Puzo, The Godfather' },
    { text: '"I\'m gonna make him an offer he <span class="em">can\'t refuse</span>."', attr: '&mdash; Vito Corleone' },
    { text: '"Keep your friends close, but your <span class="em">enemies closer</span>."', attr: '&mdash; Michael Corleone' },
    { text: '"It\'s not <span class="em">personal</span>. It\'s strictly business."', attr: '&mdash; Michael Corleone' },
    { text: '"A man who doesn\'t spend time with his family can never be a <span class="em">real man</span>."', attr: '&mdash; Vito Corleone' },
    { text: '"Revenge is a dish best served <span class="em">cold</span>."', attr: '&mdash; Old Proverb, The Godfather' },
    { text: '"I spent my whole life trying not to be <span class="em">careless</span>. Women and children can be careless, but not men."', attr: '&mdash; Vito Corleone' },
    { text: '"Never tell anyone <span class="em">outside</span> the family what you\'re thinking again."', attr: '&mdash; Vito Corleone' },
    { text: '"In my home, you will <span class="em">respect</span> the family."', attr: '&mdash; Vito Corleone' },
    { text: '"Just when I thought I was <span class="em">out</span>, they pull me back in!"', attr: '&mdash; Michael Corleone' },
  ];

  const audioCtxRef = useRef(null);
  const themeAudioRef = useRef(null);
  const videoRefs = useRef([]);
  
  const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  useEffect(() => {
    const audio = themeAudioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;
    audio.muted = true;

    let playOnInteract = null;
    let unmuteOnInteract = null;

    const attemptMutedPlay = () => {
      audio.play().then(() => {
        // Autoplay worked, keep muted state visual
      }).catch(() => {
        // Muted autoplay blocked — play unmuted on first interaction
        playOnInteract = () => {
          audio.play().then(() => {
            setAmbientActive(true);
          }).catch(e => console.log('Audio play failed:', e));
          document.removeEventListener('click', playOnInteract);
          document.removeEventListener('keydown', playOnInteract);
        };
        document.addEventListener('click', playOnInteract);
        document.addEventListener('keydown', playOnInteract);
      });
    };

    // Unmute on first interaction if muted autoplay succeeded
    unmuteOnInteract = () => {
      audio.muted = false;
      setAmbientActive(true);
      document.removeEventListener('click', unmuteOnInteract);
      document.removeEventListener('keydown', unmuteOnInteract);
    };

    // Try playing once audio can play through
    audio.addEventListener('canplaythrough', attemptMutedPlay, { once: true });
    attemptMutedPlay();

    document.addEventListener('click', unmuteOnInteract);
    document.addEventListener('keydown', unmuteOnInteract);

    return () => {
      if (unmuteOnInteract) {
        document.removeEventListener('click', unmuteOnInteract);
        document.removeEventListener('keydown', unmuteOnInteract);
      }
      if (playOnInteract) {
        document.removeEventListener('click', playOnInteract);
        document.removeEventListener('keydown', playOnInteract);
      }
    };
  }, []);

  // Preloader & Slideshow
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setSlideshowIndex((prev) => (prev + 1) % 5);
    }, 1100);

    const timer = setTimeout(() => {
      setIsLoading(false);
      clearInterval(slideInterval);
    }, 5500);

    return () => {
      clearTimeout(timer);
      clearInterval(slideInterval);
    };
  }, []);

  // Quote auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Custom Cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorDotPos({ x: e.clientX, y: e.clientY });
      // Smooth follow for the outer ring
      setTimeout(() => {
        setCursorPos({ x: e.clientX, y: e.clientY });
      }, 50);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Navbar Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Web Audio API for Ambient Sound
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const setAmbientVolume = (vol) => {
    if (themeAudioRef.current) {
      themeAudioRef.current.volume = vol / 100;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    setAmbientVolume(newVol);
  };

  const toggleSound = () => {
    const audio = themeAudioRef.current;
    if (!audio) return;
    
    // If paused, try to play it first
    if (audio.paused) {
      audio.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Toggle mute
    audio.muted = !audio.muted;
    setAmbientActive(!audio.muted);
  };

  // Character Audio Feedback
  const playCharacterTone = (freq) => {
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch(e) {}
  };

  const noteFreqs = {
    vito: 130.81,
    michael: 146.83,
    sonny: 164.81,
    tom: 174.61,
    fredo: 196.00,
    luca: 110.00
  };

  const handleVideoPlay = (index) => {
    setPlayingVideoIndex(index);
    videoRefs.current.forEach((ref, i) => {
      if (i !== index && ref) {
        ref.pause();
      }
    });
  };

  return (
    <>
      {/* Preloader / Slideshow */}
      <div id="preloader" className={isLoading ? '' : 'hidden'}>
        <div className="slideshow-container">
          {[
            `/images/poster1_h.png`,
            `/images/poster2_h.png`,
            `/images/poster3_h.png`,
            `/images/poster4_h.png`,
            `/images/poster5_h.png`
          ].map((url, index) => (
            <div 
              key={index}
              className={`slide ${index === slideshowIndex ? 'active' : ''}`}
            >
              <img src={url} alt={`Scene ${index}`} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ))}
        </div>
        <div className="preloader-overlay"></div>
        <div className="puppet-strings">
          <div className="string"></div>
          <div className="string"></div>
          <div className="string"></div>
        </div>
        <div className="load-text">An Offer You Can't Refuse</div>
        <div className="load-bar"></div>
      </div>

      {/* Custom Cursor */}
      <div 
        className={`custom-cursor ${isHovering ? 'hovering' : ''}`} 
        style={{ left: cursorPos.x, top: cursorPos.y }}
      ></div>
      <div 
        className="cursor-dot" 
        style={{ left: cursorDotPos.x, top: cursorDotPos.y }}
      ></div>

      {/* Navigation */}
      <nav id="navbar" className={isScrolled ? 'scrolled' : ''}>
        <a href="#hero" className="nav-logo">The Godfather</a>
        <ul className="nav-links">
          <li><a href="#story" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>The Story</a></li>
          <li><a href="#timeline" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Timeline</a></li>
          <li><a href="#characters" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Family</a></li>
          <li><a href="#scenes" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Iconic Scenes</a></li>
          <li><a href="#legacy" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Legacy</a></li>
        </ul>
        <button 
          className="nav-sound-toggle" 
          onClick={toggleSound}
          onMouseEnter={() => setIsHovering(true)} 
          onMouseLeave={() => setIsHovering(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.span
            key={ambientActive ? 'active' : 'inactive'}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'inline-flex' }}
          >
            {ambientActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </motion.span>
        </button>
        <button 
          className="nav-menu-btn" 
          onClick={() => setIsMobileNavOpen(true)}
          onMouseEnter={() => setIsHovering(true)} 
          onMouseLeave={() => setIsHovering(false)}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${isMobileNavOpen ? 'active' : ''}`}>
        <button className="mobile-nav-close" onClick={() => setIsMobileNavOpen(false)}><X size={28} /></button>
        <a href="#story" className="mobile-link" onClick={() => setIsMobileNavOpen(false)}>The Story</a>
        <a href="#timeline" className="mobile-link" onClick={() => setIsMobileNavOpen(false)}>Timeline</a>
        <a href="#characters" className="mobile-link" onClick={() => setIsMobileNavOpen(false)}>Family</a>
        <a href="#scenes" className="mobile-link" onClick={() => setIsMobileNavOpen(false)}>Iconic Scenes</a>
        <a href="#legacy" className="mobile-link" onClick={() => setIsMobileNavOpen(false)}>Legacy</a>
      </div>

      {/* Hero Section */}
      <section id="hero">
        <div className="hero-fallback-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-vignette"></div>
        <div className="hero-content">
          <p className="hero-subtitle">Francis Ford Coppola &middot; 1972</p>
          <h1 className="hero-title">The<br /><span className="gold">Godfather</span></h1>
          <p className="hero-tagline">"I'm gonna make him an offer he can't refuse."</p>
          <a href="#story" className="hero-cta" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            Enter the Family
            <ArrowRight size={12} style={{ marginLeft: '8px' }} />
          </a>
        </div>
        <div className="hero-scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Quote Section */}
      <section id="quote">
        <div className="quote-content">
          <div className="quote-mark">&ldquo;</div>
          <motion.p 
            className="quote-text"
            key={quoteIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            dangerouslySetInnerHTML={{ __html: quotes[quoteIndex].text }}
          />
          <motion.p 
            className="quote-attr"
            key={`attr-${quoteIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            dangerouslySetInnerHTML={{ __html: quotes[quoteIndex].attr }}
          />
          <div className="quote-dots">
            {quotes.map((_, i) => (
              <span key={i} className={`quote-dot ${i === quoteIndex ? 'active' : ''}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section id="story">
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
        >
          <div className="section-label">The Saga Begins</div>
          <h2 className="section-title">A Crime Family's<br />American Dream</h2>
          <div className="section-divider"></div>
        </motion.div>
        <div className="story-grid">
          <motion.div 
            className="story-image-wrap"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
          >
            <img src={`/images/family.jpg`} alt="The Corleone Family" loading="lazy" />
            <div className="img-overlay"></div>
            <div className="img-year">1945</div>
          </motion.div>
          <motion.div 
            className="story-text"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
          >
            <p>
              In the dimly lit study of his home on Long Island, <strong>Don Vito Corleone</strong> holds court on the day of his daughter's wedding. A man of quiet power and ancient customs, he dispenses justice and favors with the gravity of a Roman emperor — each whisper carrying the weight of an empire built on loyalty, fear, and blood.
            </p>
            <p>
              Based on Mario Puzo's bestselling novel, Francis Ford Coppola's masterpiece transcends the gangster genre to become a <strong>Shakespearean tragedy of power, family, and the American Dream</strong> — inverted, corrupted, yet hauntingly recognizable.
            </p>
            <p>
              The film's deliberate pacing, Nino Rota's haunting score, and Gordon Willis's revolutionary cinematography — <strong>the "Prince of Darkness"</strong> — created a visual language that redefined cinema forever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline">
        <div className="timeline-inner">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Chronicle of Power</div>
            <h2 className="section-title">The Corleone Saga</h2>
          </div>

          {[
            { year: '1945', title: 'The Wedding Day', desc: 'Inside the Don\'s study, supplicants come to ask for favors on the day no Sicilian can refuse.', img: `/images/wedding.jpg` },
            { year: '1945', title: 'The Assassination Attempt', desc: 'Five bullets tear through the Don\'s body on a street in Little Italy.', img: `/images/assassination.png` },
            { year: '1946', title: 'Baptism of Fire', desc: 'In one of cinema\'s most breathtaking sequences, the sacred rite of baptism intercuts with systematic executions.', img: `/images/baptism.jpg` },
            { year: '1958', title: 'The Succession', desc: 'Michael has become what his father never wanted him to be — colder, more calculating, more ruthless.', img: `/images/succession.jpg` }
          ].map((item, index) => (
            <motion.div 
              className="timeline-item" 
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="tl-content">
                <div className="tl-year">{item.year}</div>
                <h3 className="tl-title">{item.title}</h3>
                <p className="tl-desc">{item.desc}</p>
              </div>
              <div className="tl-spacer"></div>
              <div className="tl-dot"></div>
              <div className="tl-content">
                <div className="tl-image">
                  <img src={item.img} alt={item.title} loading="lazy" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Characters Section */}
      <section id="characters">
        <div style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>The Five Families</div>
          <h2 className="section-title">Men of Honor</h2>
        </div>
        <div className="characters-grid">
          {[
            { id: 'vito', name: 'Vito Corleone', role: 'The Don · Patriarch', quote: '"I spent my life trying not to be careless. People who are careless die young."', img: `/images/vito.jpg` },
            { id: 'michael', name: 'Michael Corleone', role: 'The Successor', quote: '"It\'s strictly business, Sonny. It\'s not personal."', img: `/images/michael.jpg` },
            { id: 'sonny', name: 'Sonny Corleone', role: 'Underboss', quote: '"You\'re taking this very personal. Tom, this is business."', img: `/images/sonny.jpg` },
            { id: 'tom', name: 'Tom Hagen', role: 'Consigliere', quote: '"Mr. Corleone is a man who insists on hearing bad news immediately."', img: `/images/tom.jpg` },
            { id: 'fredo', name: 'Fredo Corleone', role: 'Middle Brother', quote: '"I can handle things! I\'m smart! Not like everybody says."', img: `/images/fredo.jpg` },
            { id: 'luca', name: 'Luca Brasi', role: 'Enforcer', quote: '"I am honored and grateful that you have invited me to your home."', img: `/images/luca.jpg` }
          ].map((char, index) => (
            <motion.article 
              className="character-card" 
              key={char.id}
              onMouseEnter={() => {
                setIsHovering(true);
                playCharacterTone(noteFreqs[char.id]);
              }} 
              onMouseLeave={() => setIsHovering(false)}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="char-image">
                <img src={char.img} alt={char.name} loading="lazy" />
              </div>
              <div className="char-info">
                <h3 className="char-name">{char.name}</h3>
                <p className="char-role">{char.role}</p>
                <p className="char-quote">{char.quote}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Scenes Section */}
      <section id="scenes">
        <div className="scenes-header">
          <div className="section-label">Cinematic Mastery</div>
          <h2 className="section-title">Iconic Moments</h2>
        </div>
        <div className="scenes-gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', maxWidth: '1200px', margin: '40px auto 0', gridAutoRows: 'auto' }}>
          {[
            { title: '"I Believe in America"', act: 'Act I', videoName: 'opening_scene', img: 'https://picsum.photos/seed/gf-opening-scene/800/560.jpg' },
            { title: 'The Horse\'s Head', act: 'Act I', videoName: 'horse_head', img: 'https://picsum.photos/seed/gf-horse-head/400/280.jpg' },
            { title: 'The Restaurant', act: 'Act I', videoName: 'restaurant', img: 'https://picsum.photos/seed/gf-restaurant/400/280.jpg' },
            { title: 'The Baptism', act: 'Act III', videoName: 'baptism', img: 'https://picsum.photos/seed/gf-baptism/800/280.jpg' }
          ].map((scene, index) => (
            <motion.div 
              className="scene-card" 
              key={index}
              onMouseEnter={() => {
                setIsHovering(true);
                videoRefs.current[index]?.play().catch(e => console.log(e));
                setPlayingVideoIndex(index);
                // Pause ambient music
                themeAudioRef.current?.pause();
              }} 
              onMouseLeave={() => {
                setIsHovering(false);
                videoRefs.current[index]?.pause();
                setPlayingVideoIndex(null);
                // Resume ambient music if it was active
                if (ambientActive) {
                  themeAudioRef.current?.play().catch(e => console.log(e));
                }
              }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: index * 0.1 }}
              viewport={{ once: true }}
              style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', gridColumn: 'auto', gridRow: 'auto' }}
            >
              <video 
                ref={el => videoRefs.current[index] = el}
                src={`/videos/${scene.videoName}.mp4`}
                loop
                preload="auto"
                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#050504' }}
              />
              {playingVideoIndex !== index && (
                <div className="scene-overlay" style={{ pointerEvents: 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                  <span className="scene-label">{scene.act}</span>
                  <h3 className="scene-title" style={{ fontSize: '1.5rem', marginTop: '5px' }}>{scene.title}</h3>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Legacy Section */}
      <section id="legacy" style={{ padding: '100px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', letterSpacing: '4px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center', width: '100%' }}>Cinematic Immortality</div>
          <h2 className="section-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: 'var(--fg)', marginBottom: '20px' }}>The Legacy</h2>
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', color: 'var(--fg-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '20px' }}>
            Released in 1972, <em>The Godfather</em> revolutionized American cinema. It transformed the gangster genre into a Shakespearean tragedy of family, power, and betrayal.
          </p>
          <p style={{ marginBottom: '40px' }}>
            Winning 3 Academy Awards, including Best Picture, it is widely considered one of the greatest and most influential films in world cinema. Its impact on culture, language, and filmmaking continues to resonate to this day.
          </p>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--gold)', fontStyle: 'italic', position: 'relative', display: 'inline-block' }}>
            <span style={{ fontSize: '4rem', position: 'absolute', left: '-30px', top: '-20px', opacity: 0.3 }}>“</span>
            An offer that cinema couldn't refuse.
            <span style={{ fontSize: '4rem', position: 'absolute', right: '-30px', bottom: '-40px', opacity: 0.3 }}>”</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#hero" className="nav-logo" style={{ marginBottom: '16px', display: 'inline-block' }}>The Godfather</a>
              <p style={{ color: 'var(--fg-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px', maxWidth: '300px' }}>
                "Great men are not born great, they grow great..." A tribute to Francis Ford Coppola's cinematic masterpiece.
              </p>
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '16px', marginTop: '24px' }}>Check My Other Works</h4>
              <div className="footer-socials">
                <a href="https://github.com/Ramjianonmyous" target="_blank" rel="noopener noreferrer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5-.72 1.03-1.07 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                </a>
                <a href="https://www.linkedin.com/in/ram-kaithwas-329419257/" target="_blank" rel="noopener noreferrer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://portfolio-2-0-kohl-five.vercel.app/" target="_blank" rel="noopener noreferrer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Navigation</h4>
              <ul>
                <li><a href="#story" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>The Story</a></li>
                <li><a href="#timeline" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Timeline</a></li>
                <li><a href="#characters" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Family</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legacy</h4>
              <ul>
                <li><a href="#scenes" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Iconic Scenes</a></li>
                <li><a href="#legacy" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Legacy</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Credit</h4>
              <ul>
                <li><span style={{ color: 'var(--fg-muted)', fontSize: '15px' }}>Tribute to Legendary Godfather</span></li>
                <li><span style={{ color: 'var(--fg-muted)', fontSize: '15px' }}>Made by Ram Kaithwas</span></li>
                <li><span style={{ color: 'var(--fg-muted)', fontSize: '15px' }}>AI Assistant: Antigravity</span></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Fan tribute &middot; Not affiliated with Paramount Pictures</p>
            <p style={{ color: 'var(--fg-muted)', fontSize: '13px' }}>&copy; 2026</p>
          </div>
        </div>
      </footer>

      {/* Audio Bar */}
      <div className={`audio-bar ${ambientActive ? 'active' : ''}`}>
        <div className="ab-info">
          <div className="ab-icon"><Music size={12} /></div>
          <div className="ab-text">
            <strong>Nino Rota</strong> &mdash; Speak Softly Love
          </div>
        </div>
        <div className="ab-controls">
          <button className="ab-btn"><SkipBack size={14} /></button>
          <button className="ab-btn play-pause" onClick={toggleSound}>
            {ambientActive ? <Pause size={11} /> : <Play size={11} />}
          </button>
          <button className="ab-btn"><SkipForward size={14} /></button>
        </div>
        <div className="ab-progress">
          <div className="ab-progress-fill" style={{ width: '30%' }}></div>
        </div>
        <div className="ab-volume">
          <Volume1 size={12} style={{ color: 'var(--fg-muted)' }} />
          <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} />
        </div>
        <button className="ab-close" onClick={() => setAmbientActive(false)}><X size={14} /></button>
      </div>

      {/* Audio Element */}
      <audio 
        ref={themeAudioRef} 
        src={`/music/theme.mp3`} 
        loop 
        style={{ display: 'none' }}
      />

      {/* Video Modal */}
      <div className={`video-modal ${isVideoModalOpen ? 'active' : ''}`} onClick={() => setIsVideoModalOpen(false)}>
        <div className="video-modal-inner" onClick={e => e.stopPropagation()}>
          <button className="close-modal" onClick={() => setIsVideoModalOpen(false)}><X size={24} /></button>
          <div className="video-modal-placeholder">
            <Film size={48} style={{ color: 'var(--gold-dark)', marginBottom: '16px' }} />
            <p>Scene Footage</p>
            <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.5 }}>Connect video source to play</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
