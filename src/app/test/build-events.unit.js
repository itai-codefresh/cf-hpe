/* eslint-env mocha */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import './config.env';
import _ from 'lodash';
import { expect } from 'chai';
import BuildEvents from 'app/build-events';

describe('BuildEvents', function () {
  this.slow(2000);
  this.timeout(30000);

  it('Should return builds log ref', function (done) {
    BuildEvents
      .getBuildLogsRef()
      .flatMap(buildLogRef => {
        return buildLogRef
          .orderByChild('lastUpdate')
          .startAt(0)
          .rx_onChildAdded()
          .map(snapshot => snapshot.val().lastUpdate)
          .reduce((prev, value) => {
            let result = true;
            if (value < prev) {
              result = false;
            }

            expect(result).to.be.true;
            return value;
          })
          .doOnNext(() => {
            done();
          });

      })
      .subscribe();
  });

  it.only('Should receive builds log events', function (done) {
    BuildEvents
      .getBuildLogsEvents()
      .doOnNext(buildEvent => {

      })
      .doOnError(error => done(error))
      .subscribe();
  });

  it('Should find account using account id', function (done) {
    const accountId = '5714840d088bc00600c22f3a';

    BuildEvents
      .findAccount(accountId)
      .doOnNext(account => {
        expect(account._id).to.exist;
      })
      .finally(() => done())
      .subscribe();
  });

  it('Should find service using progress id', function (done) {
    const progressId = '5718d772a10b7206000937cf';

    BuildEvents
      .findServiceByProgressId(progressId)
      .doOnNext(service => {
        expect(service._id).to.exist;
      })
      .finally(() => done())
      .subscribe();
  });
});
