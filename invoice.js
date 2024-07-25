let itemCounter = 0;

function addInvoiceItem() {
  itemCounter++;

  const newItemRow = `
<tr id = "itemRow${itemCounter}">
<td class="serial-number">${itemCounter}</td> <!-- Add Serial Number -->s
<td><input type="text" class= "form-control" placeholder="Enter Description" required></td>
<td><input type="number" min="0" class= "form-control  unitPrice" placeholder="0" required></td>
<td><input type="number" min="0" class= "form-control  quantity" placeholder="0" required></td>
   <td>
        <select class="form-control discount" placeholder = "select" required>
          <option value="0">0%</option>
          <option value="10">10%</option>
          <option value="20">20%</option>
          <option value="30">30%</option>
          <option value="40">40%</option>
          <option value="50">50%</option>
        </select>
      </td><td><input type="text" class= "form-control  netAmount" placeholder="0" readonly></td>
      <td>
        <select class="form-control taxType" required>
          <option value="CGST/SGST">CGST/SGST</option>
          <option value="IGST">IGST</option>
        </select>
      </td>
<td><input type="number" class= "form-control  taxRate" placeholder="2.5%" disabled readonly></td>

  <td><input type="text" class= "form-control  taxAmount"  placeholder="0" disabled readonly></td>
<td><input type="text" class= "form-control  totalAmountPrice"placeholder="0" disabled readonly></td>
<td><button type="button" class="btn btn-danger" onclick="removeInvoiceItem(${itemCounter})">Remove</button></td>
`;

  $("#invoiceItems").append(newItemRow);

  // Attach change event listener to update the amounts when discount changes
  $(
    `#itemRow${itemCounter} .discount, #itemRow${itemCounter} .unitPrice, #itemRow${itemCounter} .quantity`
  ).change(function () {
    updateNetAmount();
    updateTaxAmount();
    updateTotalAmount();
  });

  // Update total amount on every item added
  updateNetAmount();
  updateTaxAmount();
  updateTotalAmount();
}

function removeInvoiceItem(itemId) {
  $(`#itemRow${itemId}`).remove();
  updateSerialNumbers(); // Call function to update serial numbers
  updateTotalAmount();
}
function updateSerialNumbers() {
  let currentNumber = 1;
  $("tr[id^='itemRow']").each(function () {
    $(this).find(".serial-number").text(currentNumber);
    currentNumber++;
  });
}

function updateNetAmount() {
  $("tr[id^='itemRow']").each(function () {
    const quantity = parseFloat($(this).find(".quantity").val()) || 0;
    const unitPrice = parseFloat($(this).find(".unitPrice").val()) || 0;
    const discountRate = parseFloat($(this).find(".discount").val()) || 0;

    const discountAmount = (unitPrice * quantity * discountRate) / 100;
    const netAmount = unitPrice * quantity - discountAmount;

    $(this).find(".netAmount").val(netAmount.toFixed(2));
  });
}

function updateTaxAmount() {
  $("tr[id^='itemRow']").each(function () {
    const netAmount = parseFloat($(this).find(".netAmount").val()) || 0;
    const taxType = $(this).find(".taxType").val();
    const taxRate = 18 / 100;
    const taxAmount = netAmount * taxRate;

    $(this).find(".taxAmount").val(taxAmount.toFixed(2));
    $(this)
      .find(".taxRate")
      .val((taxRate * 100).toFixed(2)); // Set tax rate to 18%
  });
}

function updateTotalAmount() {
  let totalAmount = 0;
  let totalTaxAmount = 0;

  $("tr[id^='itemRow']").each(function () {
    const netAmount = parseFloat($(this).find(".netAmount").val()) || 0;
    const taxAmount = parseFloat($(this).find(".taxAmount").val()) || 0;
    const totalAmountPrice = netAmount + taxAmount;

    $(this).find(".totalAmountPrice").val(totalAmountPrice.toFixed(2));
    totalAmount += totalAmountPrice;
    totalTaxAmount += taxAmount;
  });

  $("#totalAmount").val(totalAmount.toFixed(2));
  $("#totalTaxAmount").val(totalTaxAmount.toFixed(2));
}

$("#invoiceForm").submit(function (event) {
  event.preventDefault();
  updateTotalAmount();
});

// for sign image
let signatoryImageBase64 = "";

document
  .getElementById("authorized-signatory-image")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
      signatoryImageBase64 = reader.result;
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  });

//print Bill Invoice

function printInvoice() {
  const soldBy = $("#sold-by").val();
  const soldAddress = $("#sold-address").val();
  const soldPan = $("#sold-pan").val();
  const soldGST = $("#sold-gst").val();
  const billingName = $("#billing-name").val();
  const billingAddress = $("#billing-address").val();
  const billingState = $("#billing-state").val();
  const shippingName = $("#shipping-name").val();
  const shippingAddress = $("#shipping-address").val();
  const shippingState = $("#shipping-state").val();

  const orderNumber = $("#order-number").val();
  const orderDate = $("#order-date").val();
  const invoiceNumber = $("#invoice-number").val();
  const invoiceDetails = $("#invoice-details").val();
  const invoiceDate = $("#invoice-date").val();

  const amountWords = $("#amount-words").val();

  const items = [];

  $("tr[id^='itemRow']").each(function () {
    const description = $(this).find("td:eq(1) input").val();
    const unitPrice = $(this).find("td:eq(2) input").val();
    const quantity = $(this).find("td:eq(3) input").val();
    const discount = $(this).find("td:eq(4) select").val();
    const netAmount = $(this).find("td:eq(5) input").val();
    const taxRate = "18%";
    const taxType = $(this).find("td:eq(7) select").val();
    const taxAmount = $(this).find("td:eq(8) input").val();
    const totalAmountPrice = $(this).find("td:eq(9) input").val();

    items.push({
      description: description,
      unitPrice: unitPrice,
      quantity: quantity,
      discount: discount,
      netAmount: netAmount,
      taxRate: taxRate,
      taxType: taxType,
      taxAmount: taxAmount,
      totalAmountPrice: totalAmountPrice,
    });
  });

  const totalAmount = $("#totalAmount").val();
  const totalTaxAmount = $("#totalTaxAmount").val();

  // Base64 string for the image
  const base64Image = "data:image/png;base64, [YourBase64ImageHere]";

  const invoiceContent = `
  <html>
    <head>
        <title>Amazon Invoice</title>
        <style>
 body{
   font-family: Arial, sans-serif;
   margin:20px;
}
h2{
color: #007bff;
 }
table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
}
 th,
    td{
       border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
      }
            .total{
                font-weight: bold;
            }
       

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
}
.auth{
text-align: right;
}
.invoice-container {
    width: 860px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.header {
    text-align: center;
    margin-bottom: 20px;
}

.header .logo {
    width: 100px;
}

.header h1 {
    margin: 0;
    font-size: 24px;
}

.section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.section .left,
.section .right {
    width: 48%;
}

.section p {
    margin: 5px 0;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

table, th, td {
    border: 1px solid #ccc;
}

th, td {
    padding: 8px;
    text-align: left;
}

tfoot td {
    font-weight: bold;
    text-align: left;
}
    .highlight-row {
    background-color: #bfb5b5; /* Light grey color for highlighting */
}
th, td {
   padding: 10px;
   text-align: left;
    }
th {
    background-color: #f2f2f2;
    }
.highlight-row {
    background-color: #f2f2f2;
    }
tfoot td {
    font-weight: bold;
    }
tfoot .total {
    text-align: right; /* Align text to the left for the Total row */
}
tfoot td.total {
    text-align: right;
    }
.signatory-image {
  max-width: 100px; /* Set maximum width */
  max-height: 100px; /* Set maximum height */
  display: block; /* Make it a block element to allow margin properties */
  float: right; /* Align image to the right */
}
  .auth {
  text-align: right; /* Align text to the right */
  margin-top: 20px; /* Optional: Adjust spacing from the content above */
}
</style>
    </head>
    <body>
          <div class="invoice-container">
          <div class="header">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon Logo" class="logo">
            <h1>Tax Invoice/Bill of Supply/Cash Memo</h1>
            <p>(Original for Recipient)</p>
        </div>
        <div class="section">
            <div class="left">
                <p><strong>Sold By :</strong></p>
                <p>${soldBy}</p>
                <p>${soldAddress}</p>
                <p>${soldPan}</p>
                <p>${soldGST}</p>
            </div>
            <div class="right">
                <p><strong>Billing Address :</strong></p>
                <p>${billingName}</p>
                <p>${billingAddress}</p>
                <p>${billingState}</p>
            </div>
        </div>
        <div class="section">
            <div class="left">
                <p><strong>Shipping Address :</strong></p>
                <p>${shippingName}</p>
                <p>${shippingAddress}</p>
                <p>${shippingState}</p>
            </div>
            <div class="right">
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Invoice Details:</strong> ${invoiceDetails}</p>
                <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
            </div>
        </div>
        <table>
            <thead>
                <tr class="highlight-row">
                  <th scope="col">S.No</th> <!-- Serial Number Column Header -->
                    <th scope="col">Description:</th>
                    <th scope="col">Unit Price:</th>
                    <th scope="col">Quantity:</th>
                    <th scope="col">Discount:</th>
                    <th scope="col">Net Amount</th>
                    <th scope="col">Tax Rate:</th>
                    <th scope="col">Tax Type:</th>
                    <th scope="col">Tax Amount:</th>
                    <th scope="col">Total Amount Price:</th>
                </tr>
            </thead>
            <tbody>
                ${items
                  .map(
                    (item, index) => `
                    <tr>
                        <td>${index + 1}</td> <!-- Serial Number in Invoice -->
                        <td>${item.description}</td>
                        <td>${item.unitPrice}</td>
                        <td>${item.quantity}</td>
                        <td>${item.discount}%</td>
                        <td>${item.netAmount}</td>
                        <td>${item.taxRate}</td>
                        <td>${item.taxType}</td>
                        <td>${item.taxAmount}</td>
                        <td>${item.totalAmountPrice}</td>
                    </tr>
                    `
                  )
                  .join("")}
            </tbody>
              <tfoot>
                <tr>
                    <td colspan="8" class="total">Total:</td>
                    <td>${totalTaxAmount}</td>
                    <td>${totalAmount}</td>
                </tr>
                  <tr>
                    <td colspan="10"><strong>Amount in Words:</strong> ${amountWords}</td>
                  
                </tr>
    <tr>
                        <td colspan="10" class="auth">
                        <strong>For ${soldBy}</strong><br>
                          ${
                            signatoryImageBase64
                              ? `<img src="${signatoryImageBase64}" class="signatory-image">`
                              : ""
                          }<br>
                          <br>
                        Authorized Signatory<br>
                      
                        </td>
                    </tr>
            </tfoot>
            
              
        </table>
     
        <p>Whether tax is payable under reverse charge - No</p>
</div>
    </body>
</html>
`;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(invoiceContent);
  printWindow.document.close();
  printWindow.print();
}
