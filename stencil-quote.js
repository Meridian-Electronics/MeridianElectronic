// Stencil quote: live estimate, file-size check, and post-submit confirmation.
(() => {
  const BASE_FEE = 5;          // USD, includes the first two stencils
  const RATE_PER_CM2 = 0.05;   // USD per cm², applied to total area of all stencils
  const MAX_FILE_BYTES = 10 * 1024 * 1024; // FormSubmit limit per submission

  const form = document.getElementById('quote-form');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const width = $('stencil-width');
  const height = $('stencil-height');
  const quantity = $('stencil-quantity');
  const areaOut = $('stencil-area');
  const totalOut = $('estimate-total');
  const fieldArea = $('field-area');
  const fieldTotal = $('field-total');
  const file = $('quote-file');
  const fileHelp = $('file-help');
  const response = $('quote-response');
  const submit = form.querySelector('button[type="submit"]');
  const submitLabel = submit.textContent;
  const fileHelpDefault = fileHelp.innerHTML;

  const showMessage = (text, isError) => {
    response.textContent = text;
    response.classList.toggle('is-error', Boolean(isError));
    response.hidden = false;
  };

  const calculate = () => {
    const w = parseFloat(width.value);
    const h = parseFloat(height.value);
    const q = parseInt(quantity.value, 10);
    if (!(w > 0 && h > 0 && q >= 2)) return null;
    const area = w * h * q;
    const total = Math.round((BASE_FEE + RATE_PER_CM2 * area) * 100) / 100;
    return { area, total };
  };

  const update = () => {
    const result = calculate();
    if (!result) {
      areaOut.textContent = '—';
      totalOut.textContent = '—';
      fieldArea.value = fieldTotal.value = '';
      return;
    }
    areaOut.textContent = `${result.area.toFixed(result.area >= 1 ? 1 : 2)} cm²`;
    totalOut.textContent = `$${result.total.toFixed(2)}`;
    fieldArea.value = result.area.toFixed(2);
    fieldTotal.value = result.total.toFixed(2);
  };

  const formatSize = (bytes) =>
    bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

  const fileTooBig = () => file.files[0] && file.files[0].size > MAX_FILE_BYTES;

  file.addEventListener('change', () => {
    const f = file.files[0];
    if (!f) { fileHelp.innerHTML = fileHelpDefault; return; }
    fileHelp.textContent = fileTooBig()
      ? `${f.name} is ${formatSize(f.size)} — over the 10 MB limit. Try zipping it, or email it to us instead.`
      : `Attached: ${f.name} (${formatSize(f.size)})`;
  });

  [width, height, quantity].forEach((el) => el.addEventListener('input', update));

  form.addEventListener('submit', (event) => {
    update();
    if (!calculate()) {
      event.preventDefault();
      showMessage('Please check your board size and quantity (minimum 2 stencils).', true);
      return;
    }
    if (fileTooBig()) {
      event.preventDefault();
      showMessage('Your file is over the 10 MB limit. Please zip it, or email it to us directly.', true);
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Sending…';
  });

  // Reset the button if the visitor returns via the back button
  window.addEventListener('pageshow', () => {
    submit.disabled = false;
    submit.textContent = submitLabel;
  });

  // Keep the redirect on whatever host serves the page (local testing, custom domain)
  const next = $('quote-next');
  if (next && location.protocol.startsWith('http')) {
    next.value = `${location.origin}${location.pathname}?sent=1`;
  }

  // Confirmation after FormSubmit redirects back here
  const params = new URLSearchParams(location.search);
  if (params.get('sent') === '1') {
    showMessage('Thanks — your request is in. A confirmation copy is on its way to your inbox, and we typically reply within 1–3 business days.');
    history.replaceState(null, '', location.pathname);
  }

  update();
})();
