﻿import {expect} from 'chai';
import {Marker, FeatureGroup, LayerGroup, Util} from 'leaflet';

describe('FeatureGroup', () => {
	describe('#_propagateEvent', () => {
		let marker;

		beforeEach(() => {
			marker = new Marker([0, 0]);
		});

		describe('when a Marker is added to multiple FeatureGroups ', () => {
			it('e.propagatedFrom should be the Marker', () => {
				const fg1 = new FeatureGroup(),
				    fg2 = new FeatureGroup();

				fg1.addLayer(marker);
				fg2.addLayer(marker);

				let wasClicked1,
				    wasClicked2;

				fg2.on('click', (e) => {
					expect(e.propagatedFrom).to.equal(marker);
					expect(e.target).to.equal(fg2);
					wasClicked2 = true;
				});

				fg1.on('click', (e) => {
					expect(e.propagatedFrom).to.equal(marker);
					expect(e.target).to.equal(fg1);
					wasClicked1 = true;
				});

				marker.fire('click', {type: 'click'}, true);

				expect(wasClicked1).to.be.true;
				expect(wasClicked2).to.be.true;
			});
		});
	});

	describe('addLayer', () => {
		it('adds the layer', () => {
			const fg = new FeatureGroup(),
			    marker = new Marker([0, 0]);

			expect(fg.hasLayer(marker)).to.be.false;

			fg.addLayer(marker);

			expect(fg.hasLayer(marker)).to.be.true;
		});

		it('supports non-evented layers', () => {
			const fg = new FeatureGroup(),
			    g = new LayerGroup();

			expect(fg.hasLayer(g)).to.be.false;

			fg.addLayer(g);

			expect(fg.hasLayer(g)).to.be.true;
		});
	});

	describe('removeLayer', () => {
		it('removes the layer passed to it', () => {
			const fg = new FeatureGroup(),
			    marker = new Marker([0, 0]);

			fg.addLayer(marker);
			expect(fg.hasLayer(marker)).to.be.true;

			fg.removeLayer(marker);
			expect(fg.hasLayer(marker)).to.be.false;
		});

		it('removes the layer passed to it by id', () => {
			const fg = new FeatureGroup(),
			    marker = new Marker([0, 0]);

			fg.addLayer(marker);
			expect(fg.hasLayer(marker)).to.be.true;

			fg.removeLayer(Util.stamp(marker));
			expect(fg.hasLayer(marker)).to.be.false;
		});
	});
});
