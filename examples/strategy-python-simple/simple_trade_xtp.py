import random
from kungfu.wingchun.constants import *

def test_timer(context, event):
    context.log.info('test timer')


def test_time_interval(context, event):
    context.log.info('test time interval')
    context.log.info('test time interval')


def pre_start(context):
    # context.hold_book()
    # context.hold_positions()
    context.log.info(f"is_book_held: {context.is_book_held()}, is_positions_mirrored: {context.is_positions_mirrored()}")
    context.log.info("pre start")
    context.add_account("xtp", "15040900")
    context.subscribe("xtp", ["600198", "600548"], Exchange.SSE)
    # context.subscribe(source, ["159901", "300030"], Exchange.SZE)
    # context.subscribe(Source.BAR, ["159901", "300030"], Exchange.SZE)


def post_start(context):
    context.log.info('strategy post start')


def pre_stop(context):
    context.log.info('strategy going down')


def post_stop(context):
    context.log.info('strategy down')


def on_quote(context, quote, location):
    # context.logger.info(f"quote: {quote}")
    side = Side.Buy
    price = quote.ask_price[0]
    price_type = random.choice([PriceType.Any, PriceType.Limit])
    context.insert_order(quote.instrument_id, Exchange.SSE, "xtp", "15040900", price, 100, price_type, side)


def on_transaction(context, transaction, location):
    pass


def on_entrust(context, entrust, location):
    pass


def on_order(context, order, location):
    if order.error_id != 0:
        context.log.info(f'order error {order.error_msg}')


def on_trade(context, trade, location):
    pass
