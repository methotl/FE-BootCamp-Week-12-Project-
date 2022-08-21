class Order {
    constructor(name) {
        this.name = name;
        this.flavors = [];
    }

    addFlavor(name, size) {
        this.flavors.push(new Flavor(name, size));
    }
}

class Flavor {
    constructor(name, size) {
        this.name = name;
        this.size = size;
    }
}

class OrderInfo {

    static url = "https://crudcrud.com/api/fd413dc3a4c145059b437bd83cf52600";

    static getAllOrders() {
        return $.get(this.url);
    }

    static getOrder(id) {
        return $.get(this.url + `/${id}`);
    }

    static createOrder(order) {
        return $.post(this.url, order);
    }

    static updateOrder(order) {
        return $.ajax({
            url: this.url + `/${order._id}`,
            dataType: 'json',
            data: JSON.stringify(order),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteOrder(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {

    static orders;

    static createOrder(name) {
        OrderInfo.createOrder(new Order(name))
            .then(() => {
                return OrderInfo.getAllOrders();
            })
            .then((orders) => this.render(orders));
    }

    static getAllOrders() {
        OrderInfo.getAllOrders().then(orders => this.render(orders));
    }

    static deleteOrder(id) {
        OrderInfo.deleteOrder(id)
        .then(() => {
            return OrderInfo.getAllOrders();
        })
        .then((orders) => this.render(orders));
    }

    static addFlavor(id) {
        for (let order of this.orders) {
            if (order._id == id) {
                order.flavors.push(new Flavor($(`#${order._id}-flavor-name`).val(), $(`#${order._id}-flavor-size`).val()));
                OrderInfo.updateOrder(order) 
                .then(() => {
                    return OrderInfo.getAllOrders();
                })
                .then((order) => this.render(order));
            }
        }
    }

    static deleteFlavor(orderId, flavorId) {
        for (let order of this.orders) {
            if(order._id == orderId) {
                for(let flavor of order.flavors) {
                    if(flavor._id == flavorId) {
                        order.flavors.splice(order.flavors.indexOf(flavor), 1);
                        OrderInfo.updateOrder(order)
                            .then(() => {
                                return OrderInfo.getAllOrders();
                            })
                            .then((orders) => this.render(orders));
                    }
                }
            }
        }
    }

    static render(orders) {
        this.orders = orders;
        $('#app').empty();
        for (let order of orders) {
            $('#app').prepend(
                `<div id="${order._id}" class="card">
                    <div class="card-header">
                        <h2>${order.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteOrder('${order._id}')">Remove Order</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${order._id}-flavor-name" class="form-control" placeholder="Flavor">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${order._id}-flavor-size" class="form-control" placeholder="Size">
                                </div>
                            </div>
                            <button id="${order._id}-new-flavor" onclick="DOMManager.addFlavor('${order._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div>
                <br>`
            );

            for (let flavor of order.flavors) {
                $(`#${order._id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${flavor._id}"<strong>Flavor: </strong> ${flavor.name}</span>
                        <span id="size-${flavor._id}"<strong>Size: </strong> ${flavor.size}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteFlavor('${order._id}', '${flavor._id}')">Delete Ice Cream</button>
                    </p>`
                );
            }
        }
    }
}


$('#createNewOrder').click(() => {
        DOMManager.createOrder($('#newOrderName').val());
        console.log($('#newOrderName').val());
        $('#newOrderName').val('');
});

DOMManager.getAllOrders();
