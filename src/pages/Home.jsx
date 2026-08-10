import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const heroFood = '/hero_food.jpg';

const cuisines = [
  { emoji: '🍕', label: 'Pizza' },
  { emoji: '🍔', label: 'Burgers' },
  { emoji: '🍱', label: 'Biryani' },
  { emoji: '🌮', label: 'Tacos' },
  { emoji: '🍜', label: 'Noodles' },
  { emoji: '🍣', label: 'Sushi' },
  { emoji: '🥗', label: 'Salads' },
  { emoji: '🧁', label: 'Desserts' },
];

const stats = [
  { value: 200, suffix: '+',   label: 'Restaurants' },
  { value: 50,  suffix: 'K+', label: 'Happy Orders' },
  { value: 30,  suffix: 'min',label: 'Avg Delivery' },
  { value: 4.8, suffix: '⭐', label: 'App Rating', decimal: true },
];

const steps = [
  { num: '01', icon: '📍', title: 'Choose Location', desc: 'Enter your delivery address and discover nearby top restaurants.' },
  { num: '02', icon: '🍽️', title: 'Pick Your Food',  desc: 'Browse menus, read reviews and add your favourite items to cart.' },
  { num: '03', icon: '🚀', title: 'Fast Delivery',   desc: 'Pay securely and track your order in real-time to your door.' },
];

const features = [
  { icon: '⚡', title: '30-Min Delivery',  desc: 'From kitchen to your door in under 30 minutes, guaranteed fresh.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Razorpay-powered checkout with UPI, cards, wallets & COD.' },
  { icon: '🌟', title: 'Top Restaurants', desc: 'Handpicked, quality-verified restaurants with real customer reviews.' },
  { icon: '📱', title: 'Live Tracking',   desc: 'Know exactly where your order is, every step of the way.' },
  { icon: '🎁', title: 'Best Deals',      desc: 'Exclusive discounts, combo offers and first-order cashback.' },
  { icon: '💬', title: '24/7 Support',    desc: 'Dedicated support team available around the clock for you.' },
];

const reviews = [
  { name: 'Rahul S.', city: 'Jaipur',  rating: 5, text: 'Order tha 30 min mein ghar aa gaya! Bahut tasty tha. FoodRush best hai! 🔥', avatar: '👨' },
  { name: 'Priya M.', city: 'Delhi',   rating: 5, text: 'Har baar try karta hoon alag restaurant — kabhi disappoint nahi kiya!',      avatar: '👩' },
  { name: 'Arjun K.', city: 'Mumbai',  rating: 5, text: 'Biryani jo yahan se order ki, waisi kahi nahi mili! Tracking amazing hai.',   avatar: '🧑' },
];

function AnimCounter({ value, suffix, decimal }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const steps = 40, dur = 1500, inc = value / steps;
        let cur = 0;
        const t = setInterval(() => {
          cur += inc;
          if (cur >= value) { setCount(value); clearInterval(t); }
          else setCount(decimal ? parseFloat(cur.toFixed(1)) : Math.floor(cur));
        }, dur / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, decimal]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  return (
    <div className="home-page">

      {/* HERO */}
      <section className="hero">
        <div aria-hidden className="floating-emojis">
          {['🍕','🍔','🌮','🍜','🍣','🧁','🍱','🥗'].map((e, i) => (
            <span key={i} className={`float-emoji fe${i+1}`}>{e}</span>
          ))}
        </div>
        <div className="container hero-grid">
          <motion.div className="hero-content" initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}>
            <motion.div className="hero-badge" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
              🔥 India's Fastest Food Delivery
            </motion.div>
            <h1 className="hero-title">
              Hunger khatam,<br />
              <span className="gradient-text">khushi shuru!</span>
            </h1>
            <p className="hero-sub">
              200+ restaurants · 50,000+ happy orders · Delivered in 30 mins. Apna favourite khana abhi order karo! 🚀
            </p>
            <div className="hero-actions">
              <Link to="/restaurants" className="btn btn-primary btn-lg">🍽️ Explore Restaurants</Link>
              <Link to="/register"    className="btn btn-ghost  btn-lg">Join Free →</Link>
            </div>
            <div className="trust-badges">
              <span>✅ Free delivery on first order</span>
              <span>🔒 100% Secure payment</span>
            </div>
          </motion.div>

          <motion.div className="hero-visual" initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.7, delay:0.15 }}>
            <div className="hero-img-wrap">
              <img src={heroFood} alt="Delicious Food" className="hero-img" />
              <motion.div className="float-card fc-top" animate={{ y:[0,-8,0] }} transition={{ repeat:Infinity, duration:3, ease:'easeInOut' }}>
                <span>🚀</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.8rem' }}>Super Fast!</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--color-text-muted)' }}>28 min avg</div>
                </div>
              </motion.div>
              <motion.div className="float-card fc-bottom" animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:2.5, ease:'easeInOut', delay:0.5 }}>
                <span>⭐</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.8rem' }}>4.8 Rating</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--color-text-muted)' }}>50k+ reviews</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s) => (
              <motion.div key={s.label} className="stat-card glass" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
                <div className="stat-value"><AnimCounter value={s.value} suffix={s.suffix} decimal={s.decimal} /></div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CUISINES */}
      <section className="cuisines-section">
        <div className="container">
          <motion.h2 className="section-heading" initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            Kya khana hai aaj? 😋
          </motion.h2>
          <div className="cuisines-grid">
            {cuisines.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity:0, scale:0.85 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay: i*0.05 }}>
                <Link to="/restaurants" className="cuisine-card">
                  <div className="cuisine-emoji">{c.emoji}</div>
                  <div className="cuisine-label">{c.label}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="container">
          <motion.h2 className="section-heading" initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            Kaise kaam karta hai? <span className="gradient-text">3 simple steps!</span>
          </motion.h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <motion.div key={s.num} className="step-card glass" initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.15 }}>
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="container">
          <motion.h2 className="section-heading" initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            Why choose <span className="gradient-text">FoodRush?</span>
          </motion.h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div key={f.title} className="feature-card glass" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.08 }} whileHover={{ y:-4 }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="reviews-section">
        <div className="container">
          <motion.h2 className="section-heading" initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            Customers ka pyaar ❤️
          </motion.h2>
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <motion.div key={r.name} className="review-card glass" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }}>
                <div style={{ fontSize:'1rem', marginBottom:'0.75rem' }}>{'⭐'.repeat(r.rating)}</div>
                <p className="review-text">"{r.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:'2rem', width:44, height:44, background:'rgba(255,107,53,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.875rem' }}>{r.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{r.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <motion.div className="cta-card" initial={{ opacity:0, scale:0.96 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}>
            <div style={{ fontSize:'3rem', marginBottom:'1.5rem' }}>🍕🍔🌮</div>
            <h2 className="cta-title">Bhookh lagi hai?</h2>
            <p className="cta-sub">Abhi order karo — 30 minutes mein fresh khana ghar pe!</p>
            <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/restaurants" className="btn btn-primary btn-lg">Order Now 🚀</Link>
              <Link to="/register"    className="btn btn-ghost  btn-lg">Sign Up Free</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        .home-page { padding-top: 70px; overflow-x: hidden; }
        .section-heading { font-size: clamp(1.5rem,3vw,2.25rem); font-weight:800; text-align:center; margin-bottom:3rem; }

        /* Hero */
        .hero { min-height:90vh; position:relative; display:flex; align-items:center;
          background: radial-gradient(ellipse at 70% 40%, rgba(255,107,53,0.12) 0%, transparent 55%),
                      radial-gradient(ellipse at 15% 80%, rgba(233,69,96,0.08) 0%, transparent 50%); overflow:hidden; }
        .hero-grid { display:grid; grid-template-columns:1fr 1fr; align-items:center; gap:4rem; padding:3rem 0; }
        .hero-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,107,53,0.12); border:1px solid rgba(255,107,53,0.3); color:var(--color-orange); padding:6px 16px; border-radius:100px; font-size:0.8rem; font-weight:600; margin-bottom:1.5rem; }
        .hero-title { font-size:clamp(2.2rem,5vw,3.75rem); font-weight:900; line-height:1.12; margin-bottom:1.25rem; letter-spacing:-0.02em; }
        .hero-sub { font-size:1.05rem; color:var(--color-text-muted); line-height:1.7; margin-bottom:2rem; max-width:440px; }
        .hero-actions { display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem; }
        .trust-badges { display:flex; flex-wrap:wrap; gap:12px; font-size:0.78rem; color:var(--color-text-muted); }
        .trust-badges span { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); padding:4px 12px; border-radius:100px; }

        .hero-visual { position:relative; }
        .hero-img-wrap { position:relative; border-radius:28px; }
        .hero-img { width:100%; border-radius:28px; box-shadow:0 40px 100px rgba(255,107,53,0.25); display:block; }
        .float-card { position:absolute; display:flex; align-items:center; gap:10px; background:rgba(15,14,23,0.85); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.12); padding:10px 16px; border-radius:14px; box-shadow:0 8px 32px rgba(0,0,0,0.4); font-size:1.5rem; }
        .fc-top    { top:24px;    left:-20px; }
        .fc-bottom { bottom:24px; right:-20px; }

        .floating-emojis { position:absolute; inset:0; pointer-events:none; }
        .float-emoji { position:absolute; font-size:2rem; opacity:0.06; animation:floatUp 12s ease-in-out infinite; }
        .fe1{left:5%;top:20%;animation-delay:0s} .fe2{left:90%;top:30%;animation-delay:1.5s}
        .fe3{left:15%;top:70%;animation-delay:3s} .fe4{left:80%;top:75%;animation-delay:4.5s}
        .fe5{left:40%;top:10%;animation-delay:2s} .fe6{left:60%;top:85%;animation-delay:6s}
        .fe7{left:25%;top:45%;animation-delay:7s} .fe8{left:75%;top:15%;animation-delay:3.5s}
        @keyframes floatUp { 0%,100%{transform:translateY(0) rotate(0)} 33%{transform:translateY(-20px) rotate(5deg)} 66%{transform:translateY(10px) rotate(-5deg)} }

        /* Stats */
        .stats-section { padding:3rem 0; }
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.25rem; }
        .stat-card { padding:1.75rem 1.5rem; text-align:center; border-radius:var(--radius-lg); transition:transform 0.2s; }
        .stat-card:hover { transform:translateY(-4px); }
        .stat-value { font-size:2.25rem; font-weight:900; color:var(--color-orange); line-height:1; margin-bottom:0.5rem; }
        .stat-label { font-size:0.85rem; color:var(--color-text-muted); font-weight:500; }

        /* Cuisines */
        .cuisines-section { padding:4rem 0; }
        .cuisines-grid { display:grid; grid-template-columns:repeat(8,1fr); gap:1rem; }
        .cuisine-card { display:flex; flex-direction:column; align-items:center; gap:10px; background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:1.25rem 0.75rem; transition:all 0.2s; text-decoration:none; }
        .cuisine-card:hover { border-color:var(--color-orange); background:rgba(255,107,53,0.06); transform:translateY(-4px); box-shadow:0 8px 24px rgba(255,107,53,0.12); }
        .cuisine-emoji { font-size:2rem; }
        .cuisine-label { font-size:0.78rem; font-weight:600; color:var(--color-text-muted); }
        .cuisine-card:hover .cuisine-label { color:var(--color-orange); }

        /* How it works */
        .how-section { padding:5rem 0; background:rgba(255,255,255,0.01); }
        .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; }
        .step-card { padding:2.5rem 2rem; border-radius:var(--radius-xl); text-align:center; }
        .step-num { font-size:4rem; font-weight:900; color:rgba(255,107,53,0.12); line-height:1; margin-bottom:-1rem; font-family:monospace; }
        .step-icon { font-size:2.5rem; margin-bottom:1rem; }
        .step-title { font-size:1.1rem; font-weight:700; margin-bottom:0.75rem; }
        .step-desc { font-size:0.875rem; color:var(--color-text-muted); line-height:1.7; }

        /* Features */
        .features-section { padding:5rem 0; }
        .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        .feature-card { padding:2rem; border-radius:var(--radius-lg); display:flex; flex-direction:column; gap:0.75rem; }
        .feature-icon { font-size:2rem; }
        .feature-title { font-size:1rem; font-weight:700; }
        .feature-desc { font-size:0.85rem; color:var(--color-text-muted); line-height:1.6; }

        /* Reviews */
        .reviews-section { padding:5rem 0; }
        .reviews-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        .review-card { padding:1.75rem; border-radius:var(--radius-lg); }
        .review-text { font-size:0.9rem; color:var(--color-text-muted); line-height:1.7; margin-bottom:1.25rem; font-style:italic; }

        /* CTA */
        .cta-section { padding:5rem 0; }
        .cta-card { background:linear-gradient(135deg,rgba(255,107,53,0.12),rgba(233,69,96,0.08),rgba(255,107,53,0.05)); border:1px solid rgba(255,107,53,0.2); border-radius:28px; padding:5rem 3rem; text-align:center; box-shadow:0 0 80px rgba(255,107,53,0.08); }
        .cta-title { font-size:clamp(1.75rem,4vw,3rem); font-weight:900; margin-bottom:1rem; }
        .cta-sub { font-size:1.1rem; color:var(--color-text-muted); margin-bottom:2.5rem; max-width:400px; margin-left:auto; margin-right:auto; }

        /* Responsive */
        @media(max-width:900px){
          .hero-grid{grid-template-columns:1fr;text-align:center;gap:2rem}
          .hero-sub{max-width:100%} .hero-actions{justify-content:center} .trust-badges{justify-content:center}
          .hero-visual{display:block;margin-top:1.5rem;max-width:500px;margin-left:auto;margin-right:auto}
          .fc-top{top:-10px;left:0} .fc-bottom{bottom:-10px;right:0}
          .stats-grid{grid-template-columns:repeat(2,1fr)}
          .cuisines-grid{grid-template-columns:repeat(4,1fr)} .steps-grid{grid-template-columns:1fr}
          .features-grid{grid-template-columns:repeat(2,1fr)} .reviews-grid{grid-template-columns:1fr}
        }
        @media(max-width:600px){
          .cuisines-grid{grid-template-columns:repeat(4,1fr)} .features-grid{grid-template-columns:1fr}
          .stats-grid{grid-template-columns:repeat(2,1fr)} .cta-card{padding:3rem 1.5rem}
        }
      `}</style>
    </div>
  );
}
