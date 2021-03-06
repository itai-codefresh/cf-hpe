/* eslint-disable new-cap */
import Rx from 'rx';
import util from 'util';
import { Record } from 'immutable';
import { HpeApiConfig, HpeApiSession, HpeApiBuildSession } from 'cf-hpe-api';
import { Logger } from 'lib/logger';
import { HpeConfig } from 'app/hpe-config';

const logger = Logger.create('BuildSession');

const hpeApiConfig = HpeApiConfig.create(
  HpeConfig.CF_HPE_SERVER_URL,
  HpeConfig.CF_HPE_USER,
  HpeConfig.CF_HPE_PASSWORD,
  HpeConfig.CF_HPE_SHARED_SPACE,
  HpeConfig.CF_HPE_WORKSPACE);

export const BuildSession = Record({
  build: null,
  hpeApiBuildSession: null,
});

BuildSession.createForBuild = (build) =>
  Rx.Observable.just({})
    .doOnNext(() => logger.info(
      'Open build session. account (%s) service (%s) build (%s)',
      build.accountName,
      build.serviceName,
      build.buildId))
    .doOnNext(() => logger.info(
      'Open hpe session. host (%s) user (%s)',
      HpeConfig.CF_HPE_SERVER_URL,
      HpeConfig.CF_HPE_USER))
    .flatMap(HpeApiSession.create(hpeApiConfig))
    .flatMap(hpeApiSession => BuildSession.openHpeCiServer(hpeApiSession, build)
      .flatMap(ciServer => BuildSession.openHpePipeline(hpeApiSession, build, ciServer)
        .map(pipeline => HpeApiBuildSession.create(
          hpeApiSession,
          ciServer.id,
          pipeline.id,
          build.buildId,
          build.buildName))
        .map(hpeApiBuildSession => new BuildSession({
          build,
          hpeApiBuildSession,
        }))));

BuildSession.reportBuildPipelineStepStatus = (buildSession, buildStep) =>
  HpeApiBuildSession.reportBuildPipelineStepStatus(
    buildSession.hpeApiBuildSession,
    buildStep.stepId,
    buildStep.startTime,
    buildStep.duration,
    buildStep.status,
    buildStep.result);

BuildSession.reportBuildPipelineTestResults = (buildSession, buildStep, testResult) =>
  Rx.Observable.just({})
    .doOnNext(() => logger.info(
      'Test result. account (%s) service (%s) build (%s) step (%s) test (%s) result (%s)',
      buildSession.build.accountName,
      buildSession.build.serviceName,
      buildSession.build.buildId,
      buildStep.stepId,
      testResult[0].name,
      testResult[0].status))
    .flatMap(() => HpeApiBuildSession.reportBuildPipelineTestResults(
      buildSession.hpeApiBuildSession,
      buildStep.stepId,
      testResult));

BuildSession.openHpeCiServer = (session, build) => {
  const id = build.accountId;
  const name = util.format('%s-%s', build.accountName, build.accountId);

  return HpeApiSession
    .findCiServer(session, id)
    .flatMap(ciServer => {
      if (ciServer) {
        return Rx.Observable.just(ciServer);
      }

      logger.info('Create hpe ci server. build (%s) id (%s) name (%s)', build.buildId, id, name);
      return HpeApiSession.createCiServer(session, id, name);
    })
    .map(ciServer => ({
      id,
      name,
      hpeId: ciServer.id,
    }));
};

BuildSession.openHpePipeline = (session, build, ciServer) => {
  const id = build.serviceId;
  const name = build.serviceName;
  const ciServerHpeId = ciServer.hpeId;

  return HpeApiSession
    .createPipeline(session, ciServerHpeId, id, name)
    .catch(error => {
      if (error.statusCode !== 409) {
        return Rx.Observable.throw(error);
      }

      return Rx.Observable.just({});
    })
    .map(() => ({
      id,
      name,
      ciServerId: ciServer.id,
    }));
};
