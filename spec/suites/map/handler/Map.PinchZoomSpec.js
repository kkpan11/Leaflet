import {expect} from 'chai';
import {LatLng, Map, Polygon, Rectangle} from 'leaflet';
import Hand from 'prosthetic-hand';
import sinon from 'sinon';
import {createContainer, removeMapContainer, pointerEventType} from '../../SpecHelper.js';
import UIEventSimulator from 'ui-event-simulator';

describe('Map.PinchZoom', () => {
	let container, map;

	beforeEach(() => {
		container = createContainer();
		map = new Map(container, {
			pinchZoom: true,
			inertia: false,
			zoomAnimation: false	// If true, the test has to wait extra 250msec
		});
		container.style.width = container.style.height = '600px';
	});

	afterEach(() => {
		removeMapContainer(map, container);
	});

	it.skipIfNotTouch('Increases zoom when pinching out', (done) => {
		map.setView([0, 0], 1);
		map.once('zoomend', () => {
			expect(map.getCenter().equals(new LatLng(0, 0))).to.be.true;
			// Initial zoom 1, initial distance 50px, final distance 450px
			expect(map.getZoom()).to.equal(4);

			done();
		});

		const hand = new Hand({timing: 'fastframe'});
		const f1 = hand.growFinger(...pointerEventType);
		const f2 = hand.growFinger(...pointerEventType);

		hand.sync(5);
		f1.wait(100).moveTo(275, 300, 0)
			.down().moveBy(-200, 0, 500).up(100);
		f2.wait(100).moveTo(325, 300, 0)
			.down().moveBy(200, 0, 500).up(100);
	});

	it.skipIfNotTouch('Decreases zoom when pinching in', (done) => {
		map.setView([0, 0], 4);
		map.once('zoomend', () => {
			expect(map.getCenter().equals(new LatLng(0, 0))).to.be.true;
			// Initial zoom 4, initial distance 450px, final distance 50px
			expect(map.getZoom()).to.equal(1);

			done();
		});

		const hand = new Hand({timing: 'fastframe'});
		const f1 = hand.growFinger(...pointerEventType);
		const f2 = hand.growFinger(...pointerEventType);

		hand.sync(5);
		f1.wait(100).moveTo(75, 300, 0)
			.down().moveBy(200, 0, 500).up(100);
		f2.wait(100).moveTo(525, 300, 0)
			.down().moveBy(-200, 0, 500).up(100);
	});

	it.skipIfNotTouch('fires zoom event while pinch zoom', (done) => {
		map.setView([0, 0], 4);

		const spy = sinon.spy();
		map.on('zoom', spy);

		let pinchZoomEvent = false;
		map.on('zoom', (e) => {
			pinchZoomEvent = e.pinch ?? pinchZoomEvent;
		});
		map.once('zoomend', () => {
			expect(spy.callCount > 1).to.be.true;
			expect(pinchZoomEvent).to.be.true;

			expect(map.getCenter().equals(new LatLng(0, 0))).to.be.true;
			// Initial zoom 4, initial distance 450px, final distance 50px
			expect(map.getZoom()).to.equal(1);

			done();
		});

		new Rectangle(map.getBounds().pad(-0.2)).addTo(map);

		const hand = new Hand({timing: 'fastframe'});
		const f1 = hand.growFinger(...pointerEventType);
		const f2 = hand.growFinger(...pointerEventType);

		hand.sync(5);
		f1.wait(100).moveTo(75, 300, 0)
			.down().moveBy(200, 0, 500).up(100);
		f2.wait(100).moveTo(525, 300, 0)
			.down().moveBy(-200, 0, 500).up(100);
	});

	it.skipIfNotTouch('Dragging is possible after pinch zoom', (done) => {
		map.setView([0, 0], 8);

		new Polygon([
			[0, 0],
			[0, 1],
			[1, 1],
			[1, 0]
		]).addTo(map);

		const hand = new Hand({
			timing: 'fastframe',
			onStop() {
				expect(map.getCenter().lat).to.equal(0);
				expect(map.getCenter().lng > 5).to.be.true;
				done();
			}
		});

		const f1 = hand.growFinger(...pointerEventType);
		const f2 = hand.growFinger(...pointerEventType);

		hand.sync(5);
		f1.wait(100).moveTo(75, 300, 0).down()
			.moveBy(200, 0, 500).up();

		f2.wait(100).moveTo(525, 300, 0)
			.down().moveBy(-200, 0, 500).up(100);

		f1.wait(100).moveTo(200, 300, 0).down()
			.moveBy(5, 0, 20) // We move 5 pixels first to overcome the 3-pixel threshold of Draggable (fastframe)
			.moveBy(-150, 0, 200) // Dragging
			.up();

	});

	it.skipIfNotTouch('PinchZoom works with disabled map dragging', (done) => {
		map.remove();

		map = new Map(container, {
			pinchZoom: true,
			inertia: false,
			zoomAnimation: false,	// If true, the test has to wait extra 250msec,
			dragging: false
		});

		map.setView([0, 0], 4);
		map.once('zoomend', () => {
			expect(map.getCenter().equals(new LatLng(0, 0))).to.be.true;
			// Initial zoom 4, initial distance 450px, final distance 50px
			expect(map.getZoom()).to.equal(1);

			done();
		});

		const hand = new Hand({timing: 'fastframe'});
		const f1 = hand.growFinger(...pointerEventType);
		const f2 = hand.growFinger(...pointerEventType);

		hand.sync(5);
		f1.wait(100).moveTo(75, 300, 0)
			.down().moveBy(200, 0, 500).up(100);
		f2.wait(100).moveTo(525, 300, 0)
			.down().moveBy(-200, 0, 500).up(100);
	});

	it.skipIfNotTouch('Layer is rendered correctly while pinch zoom when zoomAnim is true', (done) => {
		map.remove();

		map = new Map(container, {
			pinchZoom: true,
			inertia: false,
			zoomAnimation: true
		});

		map.setView([0, 0], 8);

		const polygon = new Polygon([
			[0, 0],
			[0, 1],
			[1, 1],
			[1, 0]
		]).addTo(map);

		let alreadyCalled = false;
		const hand = new Hand({
			timing: 'fastframe',
			onStop() {
				setTimeout(() => {
					if (alreadyCalled) {
						return; // Will recursivly call itself otherwise
					}
					alreadyCalled = true;

					const renderedRect = polygon._path.getBoundingClientRect();

					const width = renderedRect.width;
					const height = renderedRect.height;

					expect(height < 50).to.be.true;
					expect(width < 50).to.be.true;
					expect(height + width > 0).to.be.true;

					const x = renderedRect.x;
					const y = renderedRect.y;

					expect(x).to.be.within(299, 301);
					expect(y).to.be.within(270, 280);

					// Fingers lifted after expects as bug goes away when lifted
					this._fingers[0].up();
					this._fingers[1].up();

					done();
				}, 100);
			}
		});

		const f1 = hand.growFinger(...pointerEventType);
		const f2 = hand.growFinger(...pointerEventType);

		hand.sync(5);
		f1.wait(100).moveTo(75, 300, 0)
			.down().moveBy(200, 0, 500).up();
		f2.wait(100).moveTo(525, 300, 0)
			.down().moveBy(-200, 0, 500).up();
	});

	it('Layer is rendered correctly while pinch zoom when zoomAnim is false', (done) => {
		map.remove();

		map = new Map(container, {
			pinchZoom: true,
			inertia: false,
			zoomAnimation: false
		});

		map.setView([0, 0], 8);

		const polygon = new Polygon([
			[0, 0],
			[0, 1],
			[1, 1],
			[1, 0]
		]).addTo(map);

		UIEventSimulator.fireAt('pointerdown', 75, 300, {pointerId: 1});
		UIEventSimulator.fireAt('pointerdown', 525, 300, {pointerId: 2});

		UIEventSimulator.fireAt('pointermove', 275, 300, {pointerId: 1});
		UIEventSimulator.fireAt('pointermove', 325, 300, {pointerId: 2});

		setTimeout(() => {
			map.pinchZoom._onPointerEnd();

			const renderedRect = polygon._path.getBoundingClientRect();

			const width = renderedRect.width;
			const height = renderedRect.height;

			expect(height < 50).to.be.true;
			expect(width < 50).to.be.true;
			expect(height + width > 0).to.be.true;

			const x = renderedRect.x;
			const y = renderedRect.y;

			expect(x).to.be.within(297, 300);
			expect(y).to.be.within(270, 280);

			done();
		}, 100);
	});

	it.skipIfNotTouch('disables pinchZoom when touchZoom is false (backward compatibility)', () => {
		const warnSpy = sinon.spy(console, 'warn');

		const localContainer = createContainer();
		const localMap = new Map(localContainer, {
			touchZoom: false
		});

		expect(localMap.pinchZoom.enabled()).to.be.false;
		expect(warnSpy.calledOnce).to.be.true;
		expect(warnSpy.firstCall.args[0]).to.eq('Map: touchZoom option is deprecated and will be removed in future versions. Use pinchZoom instead.');

		warnSpy.restore();
		removeMapContainer(localMap, localContainer);
	});


	it.skipIfNotTouch('enables pinchZoom when touchZoom is true and pinchZoom is false (touchZoom takes precedence)', () => {
		const warnSpy = sinon.spy(console, 'warn');

		const localContainer = createContainer();
		const localMap = new Map(localContainer, {
			touchZoom: true,
			pinchZoom: false
		});

		expect(localMap.pinchZoom.enabled()).to.be.true;
		expect(warnSpy.calledOnce).to.be.true;
		expect(warnSpy.firstCall.args[0]).to.eq('Map: touchZoom option is deprecated and will be removed in future versions. Use pinchZoom instead.');

		warnSpy.restore();
		removeMapContainer(localMap, localContainer);
	});

});
