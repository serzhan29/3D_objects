const PDF_URL = window.PDF_URL;
const pdfContainer = document.getElementById("pdfContainer");

const drawingPanel = document.getElementById("drawingPanel");
const viewer = document.getElementById("viewer");

document.getElementById("openDrawingBtn").onclick = () => {
  drawingPanel.style.display = "flex";
  viewer.style.display = "none";
};

document.getElementById("closeDrawingBtn").onclick = () => {
  drawingPanel.style.display = "none";
  viewer.style.display = "block";
};

if (PDF_URL && pdfContainer) {
  pdfjsLib.getDocument(PDF_URL).promise.then(pdf => {
    for (let i = 1; i <= pdf.numPages; i++) {
      pdf.getPage(i).then(page => {
        const viewport = page.getViewport({ scale: 1.3 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.display = "block";
        canvas.style.margin = "0 auto 20px";

        pdfContainer.appendChild(canvas);

        page.render({ canvasContext: ctx, viewport });
      });
    }
  }).catch(() => {
    pdfContainer.innerHTML = "Ошибка загрузки PDF";
  });
}
