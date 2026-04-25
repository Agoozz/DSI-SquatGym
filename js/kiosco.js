 function renderMarketCatalog(filtro = "") {
      const g = document.getElementById('catalog-alu-grid');
      if (!g) return;

      const productosFiltrados = pDBKiosco.filter(p =>
          p.n.toLowerCase().includes(filtro.toLowerCase())
      );

      g.innerHTML = productosFiltrados.map(p => {
          const pts = Math.floor(p.p / 100);

          return `
          <div class="k-item" onclick="addMarketItem('${p.n}', ${p.p})">
              <div class="k-img" style="background-image: url('${p.i}')"></div>
              <p class="font-black text-[8px] uppercase text-white">${p.n}</p>
              <span class="text-orange-500 font-black">$${p.p}</span>
              <p class="text-[8px] text-blue-400 font-black">★ +${pts}</p>
          </div>
          `;
      }).join('');
  }

function addMarketItem(n, p, el) {
      itemsCAlu.push({n, p});
      tAluK += p;
      updateMarketCart();

      el.classList.add("added");
      setTimeout(() => el.classList.remove("added"), 300);
  }

 function updateMarketCart() {
      const b = document.getElementById('alu-cart-body');
      const descuento = parseInt(document.getElementById('alu-redeem-select')?.value || 0);

      if (itemsCAlu.length === 0) {
          b.innerHTML = `<p class="text-slate-600 text-center text-xs py-4">Carrito vacío</p>`;
          document.getElementById('alu-total-f').innerText = "$0";
          return;
      }

      // agrupar ítems por nombre
      const agrupado = {};
      itemsCAlu.forEach(it => {
          if (!agrupado[it.n]) agrupado[it.n] = { n: it.n, p: it.p, qty: 0 };
          agrupado[it.n].qty++;
      });

      b.innerHTML = Object.values(agrupado).map((it, idx) => `
          <div class="flex justify-between items-center py-2 px-1 border-b border-slate-800/60">
              <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-black text-white truncate">${it.n}</p>
                  <p class="text-[9px] text-slate-500">$${(it.p * it.qty).toLocaleString()}</p>
              </div>
              <div class="flex items-center gap-1.5 ml-2">
                  <button onclick="decrementItem('${it.n}')"
                      style="background:#c2a8a8; color:#222; width:22px; height:22px; border-radius:6px; font-weight:900; font-size:14px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer;">−</button>
                  <span class="text-xs font-black text-white w-5 text-center">${it.qty}</span>
                  <button onclick="incrementItem('${it.n}', ${it.p})"
                      style="background:#a8c2aa; color:#222; width:22px; height:22px; border-radius:6px; font-weight:900; font-size:14px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer;">+</button>
              </div>
          </div>
      `).join('');

      const subtotal = itemsCAlu.reduce((s, it) => s + it.p, 0);
      const total = Math.max(0, subtotal - descuento);
      document.getElementById('alu-total-f').innerText = "$" + total.toLocaleString();
      tAluK = total;
  }

function incrementItem(nombre, precio) {
      itemsCAlu.push({ n: nombre, p: precio });
      tAluK += precio;
      updateMarketCart();
  }

function decrementItem(nombre) {
      const idx = itemsCAlu.findLastIndex ? itemsCAlu.findLastIndex(it => it.n === nombre) : [...itemsCAlu].reverse().findIndex(it => it.n === nombre);
      const realIdx = itemsCAlu.findLastIndex ? idx : itemsCAlu.length - 1 - idx;
      if (realIdx >= 0) {
          tAluK -= itemsCAlu[realIdx].p;
          itemsCAlu.splice(realIdx, 1);
      }
      updateMarketCart();
  }

  function filtrarProductos(){
      const texto = document.getElementById("buscador-productos").value;
      renderMarketCatalog(texto);
  }

