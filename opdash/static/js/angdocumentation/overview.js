/**
 * @ngdoc overview
 * @name index
 * @description
 * ### This is important. Don't miss it!
 * 
 * #### Please follow the below notes and guidelines while preparing documenation with [ng-docs](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation).
 * 
 *  * All modules, components, their controllers, directives, services must be documented.
 * 
 *  * Documenation for angular 1.x components is not supported in ng-docs. To safely identify components in our app we will assume/maintain that all components start with '**rs**' (quotes excluded).
 * 
 *  * Description of a document must provide a link to its controller and list down all the services used in the controller (if any).
 * 
 *  * Description of a component, directive, service etc might require the need to use Markdown syntax to provide better readability. If you don't know Markdown syntax, go ahead and [learn it](http://www.markdowntutorial.com)!
 * 
 *  * Use `@link` annotation to add links to components, services etc whenever deemed necessary.
 * 
 *  * Make sure that whenever needed you always add external links (eg: link to component router docs) in documentation.
 * 
 * <br/>
 * 
 * ### Guidelines for documentaion of modules
 * > 
 *   * Mark `@ngdoc` for a module to be `object`
 *   * Always include the below annotations for a module
 *    * `@name`
 *    * `@requires` (if any)
 *    * `@description`
 *   * Every module must list down its dependent modules.
 * 
 * <br/>
 * 
 * ### Guidelines for documentaion of components
 * > 
 *   * Mark `@ngdoc` for a component to be `object`
 *   * Always include the below annotations for a component
 *    * `@name`
 *    * `@param` (if any)
 *    * `@description`
 *    * `@example` (if applicable)
 *   * Documentation for every component **must have a proper description** of its purpose.
 *   * Documentation for every component **must have an example** (if applicable) which shows the intended use of it.
 *   * Child components must include a reference to its parent component.
 * 
 * <br/>
 * 
 * ### Guidelines for documentaion of controller of a component
 * > 
 *   * Mark `@ngdoc` for the controller of a component to be `controller`
 *   * Always include the below annotations for the controller of a component
 *    * `@name`
 *    * `@description`
 *   * All properties/fields of a controller must be documented by using `@ngdoc property`
 *   * All methods/functions of a controller must be documented by using `@ngdoc method`
 * 
 * <br/>
 * 
 * ### Guidelines for documentaion of directives
 * > 
 *   * Mark `@ngdoc` for a directive to be `directive`
 *   * Always include the below annotations for a directive
 *     * `@name`
 *     * `@restrict`
 *     * `@param` (if any)
 *     * `@description`
 *     * `@example`
 * 
 * <br/>
 * 
 * ### Guidelines for documentaion of services
 * > 
 *   * Mark `@ngdoc` for a service to be `service`
 *   * Always include the below annotations for a service
 *     * `@name`
 *     * `@description`
 *   * All properties/fields of a service must be documented by using `@ngdoc property`
 *   * All methods/functions of a service must be documented by using `@ngdoc method`
 * 
 * <br/>
 * 
 * ### Guidelines for documentaion of events
 * > 
 *   * Mark `@ngdoc` for a service to be `event`
 *   * Always include the below annotations for an _event_
 *     * `@name`
 *     * `@eventOf`
 *     * `@eventType` (emit | broadcast)
 *     * `@param` (if applicable)
 *     * `@description`
 * 
 * <br/>
 * 
 * ### Guidelines for documentaion of methods
 * > 
 *   * Mark `@ngdoc` for a method inside a service or a controller to be `method`
 *   * Always include the below annotations for a method
 *     * `@name`
 *     * `@methodOf`
 *     * `@param` (if applicable)
 *     * `@returns` (if applicable)
 *     * `@description`
 * 
 * <br/>
 * 
 * ### Guidelines for documentaion of properties
 * > 
 *   * Mark `@ngdoc` for a property of a service or a controller to be `property`
 *   * Always include the below annotations for a property
 *     * `@name`
 *     * `@propertyOf`
 *     * `@description`
 * 
 * <br/>
 * 
 * That's it! You can now help us in creating better documentation for FAWS Migration UI application. Please come up with your own suggestions to improve the docs. Till then let's check the current docs, shall we? [I say yes!](http://localhost:8080/docs/api/migrationApp)
 * <br/>
 * <br/>
 * <br/>
 * <br/>
 */