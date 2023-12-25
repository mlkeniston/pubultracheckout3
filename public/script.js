paypal
  .Buttons({
    createOrder: function () {
      return fetch("/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: 1,
              quantity: 1,
            },
          ],
        }),
      })
        .then((res) => {
          if (res.ok) return res.json();
          return res.json().then((json) => Promise.reject(json));
        })
        .then(({ id }) => {
          return id;
        })
        .catch((e) => {
          console.error(e.error);
        });
    }, // Set up the transaction
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        alert("Transaction completed by " + details.payer.name.given_name);

        setTimeout(function () {
          window.location.href = "public/completion.html";
        }, 5000); // 5000 milliseconds = 5 seconds
      });
    },
  })
  .render("#paypal"); // Display payment options on your web page
