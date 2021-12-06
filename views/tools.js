function callMain() {
  window.location.href = '/views/main.html'
}

function deleteProduct(id) {
  location.href = "/deleteproductnumber?value=" + id;
}

function createProductTable(table, tableData, url, cbfuncion) {
  fetch(url, { method: 'GET' })
    .then(function (response) {
      if (!response.ok) {
        location.href = '/views/login.html'
      } else
        return response.json();
    }).then((data) => {
      let rows = table.rows.length;
      for (let trow = 1; trow < rows; trow++) {
        table.deleteRow(trow);
      }
      let index = 1;
      for (let product of Object.values(data)) {
        const row = table.insertRow();
        const id = row.insertCell(0)
        const title = row.insertCell(1);
        const picture = row.insertCell(2);
        const category = row.insertCell(3);
        const price = row.insertCell(4);
        id.innerHTML = index++;
        title.innerHTML = product.productname;
        picture.innerHTML = "<img src=http://localhost:3000/" + product.productpicture + " width=\"100\" height=\"100\">"
        category.innerHTML = product.productcategory;
        price.innerHTML= product.productprice;
      }
    }).catch(error => console.warn(error));
}