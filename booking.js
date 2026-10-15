(() => {
  const SUPABASE_URL =
    'https://gwczbdjjawsjttzskqms.supabase.co'

  const SUPABASE_KEY =
    'sb_publishable_k2ryjqJ_5Z4Etq2at3Vqhw_VP4Pbykf'

  const client =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    )

  // =========================================================
  // ESTADO
  // =========================================================

  const state = {
    services: [],
    professionals: [],

    // Agenda individual:
    // oceanpink.pt/gabriela
    fixedProfessional: null,
    fixedProfessionalSlug: null,

    selectedServices: [],
    procedureOptions: {},

    serviceOptionGroups: {},
    selectedServiceOptions: {},

    selectedProfessional: 'ANY',

    selectedDate:
      getLocalDateString(
        new Date()
      ),

    slots: [],
    selectedSlot: null,
  }

  // =========================================================
  // ELEMENTOS
  // =========================================================

  const el = {
    manicure:
      document.getElementById(
        'manicure-services'
      ),

    pedicure:
      document.getElementById(
        'pedicure-services'
      ),

    professionals:
      document.getElementById(
        'professionals-list'
      ),

    date:
      document.getElementById(
        'booking-date'
      ),

    slotsStatus:
      document.getElementById(
        'slots-status'
      ),

    slots:
      document.getElementById(
        'slots-list'
      ),

    nextButton:
      document.getElementById(
        'next-availability-button'
      ),

    nextList:
      document.getElementById(
        'next-availability-list'
      ),

    error:
      document.getElementById(
        'booking-error'
      ),

    success:
      document.getElementById(
        'booking-success'
      ),

    app:
      document.getElementById(
        'booking-app'
      ),

    name:
      document.getElementById(
        'client-name'
      ),

    phone:
      document.getElementById(
        'client-phone'
      ),

    email:
      document.getElementById(
        'client-email'
      ),

    notes:
      document.getElementById(
        'client-notes'
      ),

    confirm:
      document.getElementById(
        'confirm-booking'
      ),

    summaryServices:
      document.getElementById(
        'summary-services'
      ),

    summaryProfessional:
      document.getElementById(
        'summary-professional'
      ),

    summaryDate:
      document.getElementById(
        'summary-date'
      ),

    summaryTime:
      document.getElementById(
        'summary-time'
      ),

    summaryPrice:
      document.getElementById(
        'summary-price'
      ),
  }

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  init()

  async function init() {
    el.date.min =
      getLocalDateString(
        new Date()
      )

    el.date.value =
      state.selectedDate

    bindEvents()

    // Verificar se estamos em:
    // oceanpink.pt/gabriela
    await loadFixedProfessionalFromUrl()

    // Existe slug mas não corresponde
    // a nenhuma profissional.
    if (
      state.fixedProfessionalSlug &&
      !state.fixedProfessional
    ) {
      return
    }

    applyFixedProfessionalModeUI()

    await loadServices()

    renderAll()
  }

  // =========================================================
  // PROFISSIONAL FIXA PELO URL
  // Ex.:
  // oceanpink.pt/gabriela
  // =========================================================

  function getProfessionalSlugFromUrl() {
    const parts =
      window.location.pathname
        .split('/')
        .filter(Boolean)

    // Só consideramos um caminho simples:
    // /gabriela
    if (
      parts.length !== 1
    ) {
      return null
    }

    const slug =
      decodeURIComponent(
        parts[0]
      )
        .trim()
        .toLowerCase()

    // Páginas normais do website
    // não são slugs de profissionais.
    const reserved =
      new Set([
        'index',
        'index.html',

        'booking',
        'booking.html',

        'sobre',
        'sobre.html',

        'profissionais',
        'profissionais.html',

        'contacto',
        'contacto.html',
      ])

    if (
      !slug ||
      slug.includes('.') ||
      reserved.has(
        slug
      )
    ) {
      return null
    }

    return slug
  }

  // =========================================================
  // CARREGAR PROFISSIONAL DO URL
  // =========================================================

  async function loadFixedProfessionalFromUrl() {
    const slug =
      getProfessionalSlugFromUrl()

    if (!slug) {
      return
    }

    state.fixedProfessionalSlug =
      slug

    const {
      data,
      error,
    } = await client.rpc(
      'public_get_professional_by_slug',
      {
        p_slug:
          slug,
      }
    )

    if (error) {
      console.error(
        'Erro ao identificar profissional:',
        error
      )

      showError(
        'Não foi possível abrir esta agenda.'
      )

      return
    }

    const professional =
      data?.[0] ||
      null

    if (!professional) {
      showError(
        'Esta agenda não está disponível.'
      )

      return
    }

    state.fixedProfessional =
      professional

    state.selectedProfessional =
      professional.id

    state.professionals = [
      professional,
    ]
  }

  // =========================================================
  // UI DA AGENDA INDIVIDUAL
  // =========================================================

  function applyFixedProfessionalModeUI() {
    if (
      !state.fixedProfessional
    ) {
      return
    }

    // -------------------------------------------------------
    // ESCONDER BLOCO DE ESCOLHA DE PROFISSIONAL
    // -------------------------------------------------------

    const professionalSection =
      el.professionals?.closest(
        '.public-booking-card'
      )

    if (
      professionalSection
    ) {
      professionalSection.hidden =
        true
    }

    // -------------------------------------------------------
    // DATA PASSA A PASSO 2
    // -------------------------------------------------------

    const dateSection =
      el.date?.closest(
        '.public-booking-card'
      )

    const dateNumber =
      dateSection?.querySelector(
        '.public-booking-heading > span'
      )

    if (
      dateNumber
    ) {
      dateNumber.textContent =
        '2'
    }

    // -------------------------------------------------------
    // DADOS DA CLIENTE PASSAM A PASSO 3
    // -------------------------------------------------------

    const clientSection =
      el.name?.closest(
        '.public-booking-card'
      )

    const clientNumber =
      clientSection?.querySelector(
        '.public-booking-heading > span'
      )

    if (
      clientNumber
    ) {
      clientNumber.textContent =
        '3'
    }

    // -------------------------------------------------------
    // TEXTO DO HERO
    // -------------------------------------------------------

    const heroText =
      document.querySelector(
        '#booking-hero .container > p:last-child'
      )

    if (
      heroText
    ) {
      heroText.textContent =
        `Escolha o serviço e o horário que prefere com ${state.fixedProfessional.display_name}.`
    }

    // -------------------------------------------------------
    // TITLE
    // -------------------------------------------------------

    document.title =
      `Marcações com ${state.fixedProfessional.display_name} | Ocean Pink`
  }

  // =========================================================
  // EVENTOS
  // =========================================================

  function bindEvents() {
    el.date.addEventListener(
      'change',
      async () => {
        state.selectedDate =
          el.date.value

        state.selectedSlot =
          null

        state.slots = []

        await loadServices()

        renderServices()

        await loadProfessionals()

        renderProfessionals()

        await loadSlots()

        updateSummary()
      }
    )

    el.nextButton.addEventListener(
      'click',
      searchNextAvailability
    )

    ;[
      el.name,
      el.phone,
      el.email,
      el.notes,
    ].forEach(
      (input) => {
        input.addEventListener(
          'input',
          updateConfirmState
        )
      }
    )

    el.confirm.addEventListener(
      'click',
      createBooking
    )
  }

  // =========================================================
  // CARREGAR SERVIÇOS
  // =========================================================

  async function loadServices() {
    showError('')

    const {
      data,
      error,
    } = await client.rpc(
      'public_get_booking_services_with_promotions',
      {
        p_work_date:
          state.selectedDate,
      }
    )

    if (error) {
      console.error(
        'Erro ao carregar serviços:',
        error
      )

      showError(
        'Não foi possível carregar os serviços.'
      )

      return
    }

    state.services =
      data || []

    // =======================================================
    // AGENDA INDIVIDUAL
    //
    // Em /gabriela mostrar apenas os serviços
    // que a Gabriela realiza.
    // =======================================================

    if (
      state.fixedProfessional
    ) {
      const {
        data:
          professionalServiceData,

        error:
          professionalServiceError,
      } = await client.rpc(
        'public_get_professional_booking_service_ids',
        {
          p_professional_id:
            state.fixedProfessional.id,
        }
      )

      if (
        professionalServiceError
      ) {
        console.error(
          'Erro ao carregar serviços da profissional:',
          professionalServiceError
        )

        showError(
          'Não foi possível carregar os serviços desta profissional.'
        )

        state.services =
          []

        return
      }

      const allowedIds =
        new Set(
          (
            professionalServiceData ||
            []
          ).map(
            (item) =>
              item.service_id
          )
        )

      state.services =
        state.services.filter(
          (service) =>
            allowedIds.has(
              service.id
            )
        )

      // Remover serviços anteriormente
      // selecionados que já não sejam permitidos.
      state.selectedServices =
        state.selectedServices.filter(
          (serviceId) =>
            allowedIds.has(
              serviceId
            )
        )

      Object.keys(
        state.selectedServiceOptions
      ).forEach(
        (serviceId) => {
          if (
            !allowedIds.has(
              serviceId
            )
          ) {
            delete state
              .selectedServiceOptions[
                serviceId
              ]

            delete state
              .procedureOptions[
                serviceId
              ]
          }
        }
      )
    }

    // =======================================================
    // OPÇÕES DOS SERVIÇOS
    // =======================================================

    const serviceIds =
      state.services.map(
        (service) =>
          service.id
      )

    if (
      !serviceIds.length
    ) {
      state.serviceOptionGroups =
        {}

      return
    }

    const {
      data: optionData,
      error: optionError,
    } = await client.rpc(
      'get_booking_service_options',
      {
        p_service_ids:
          serviceIds,
      }
    )

    if (
      optionError
    ) {
      console.error(
        'Erro ao carregar opções:',
        optionError
      )

      state.serviceOptionGroups =
        {}

      return
    }

    const optionMap =
      {}

    ;(
      optionData ||
      []
    ).forEach(
      (item) => {
        optionMap[
          item.service_id
        ] =
          item.groups ||
          []
      }
    )

    state.serviceOptionGroups =
      optionMap
  }

  // =========================================================
  // PROFISSIONAIS
  // =========================================================

  async function loadProfessionals() {
    // =======================================================
    // AGENDA INDIVIDUAL
    // =======================================================

    if (
      state.fixedProfessional
    ) {
      state.professionals = [
        state.fixedProfessional,
      ]

      state.selectedProfessional =
        state.fixedProfessional.id

      return
    }

    // =======================================================
    // WEBSITE NORMAL
    // =======================================================

    if (
      !state.selectedServices.length
    ) {
      state.professionals =
        []

      return
    }

    const {
      data,
      error,
    } = await client.rpc(
      'public_get_booking_professionals',
      {
        p_service_ids:
          state.selectedServices,
      }
    )

    if (
      error
    ) {
      console.error(
        'Erro ao carregar profissionais:',
        error
      )

      state.professionals =
        []

      showError(
        'Não foi possível carregar as profissionais.'
      )

      return
    }

    state.professionals =
      data || []

    if (
      state.selectedProfessional !==
        'ANY' &&
      !state.professionals.some(
        (professional) =>
          professional.id ===
          state.selectedProfessional
      )
    ) {
      state.selectedProfessional =
        'ANY'
    }
  }

  // =========================================================
  // OPÇÕES DINÂMICAS
  // =========================================================

  function getOptionGroups(
    serviceId
  ) {
    return (
      state
        .serviceOptionGroups[
          serviceId
        ] ||
      []
    )
  }

  function getSelectedOptionIds(
    serviceId
  ) {
    const groups =
      state
        .selectedServiceOptions[
          serviceId
        ] ||
      {}

    return Object.values(
      groups
    ).flat()
  }

  function getOptionSelectionsPayload() {
    const payload =
      {}

    state.selectedServices.forEach(
      (serviceId) => {
        const ids =
          getSelectedOptionIds(
            serviceId
          )

        if (
          ids.length
        ) {
          payload[
            serviceId
          ] =
            ids
        }
      }
    )

    return payload
  }

  function getOptionExtraPrice(
    serviceId
  ) {
    const selectedIds =
      new Set(
        getSelectedOptionIds(
          serviceId
        )
      )

    let total =
      0

    getOptionGroups(
      serviceId
    ).forEach(
      (group) => {
        ;(
          group.options ||
          []
        ).forEach(
          (option) => {
            if (
              selectedIds.has(
                option.id
              )
            ) {
              total +=
                Number(
                  option
                    .price_delta ||
                  0
                )
            }
          }
        )
      }
    )

    return total
  }

  function requiredOptionsComplete() {
    return state
      .selectedServices
      .every(
        (serviceId) =>
          getOptionGroups(
            serviceId
          ).every(
            (group) => {
              if (
                !group.required
              ) {
                return true
              }

              return (
                (
                  state
                    .selectedServiceOptions[
                      serviceId
                    ]?.[
                      group.id
                    ] ||
                  []
                ).length >
                0
              )
            }
          )
      )
  }

  async function selectServiceOption(
    serviceId,
    group,
    optionId
  ) {
    const serviceSelections = {
      ...(
        state
          .selectedServiceOptions[
            serviceId
          ] ||
        {}
      ),
    }

    const currentIds =
      serviceSelections[
        group.id
      ] ||
      []

    // -------------------------------------------------------
    // SEM OPÇÃO
    // Ex.: Sem Nail Art
    // -------------------------------------------------------

    if (
      optionId ===
      null
    ) {
      if (
        group.required
      ) {
        return
      }

      serviceSelections[
        group.id
      ] = []
    }

    // -------------------------------------------------------
    // SINGLE
    // -------------------------------------------------------

    else if (
      group.selection_type ===
      'SINGLE'
    ) {
      serviceSelections[
        group.id
      ] = [
        optionId,
      ]
    }

    // -------------------------------------------------------
    // MULTIPLE
    // -------------------------------------------------------

    else {
      serviceSelections[
        group.id
      ] =
        currentIds.includes(
          optionId
        )
          ? currentIds.filter(
              (id) =>
                id !==
                optionId
            )
          : [
              ...currentIds,
              optionId,
            ]
    }

    state.selectedServiceOptions[
      serviceId
    ] =
      serviceSelections

    // A opção pode alterar duração.
    state.selectedSlot =
      null

    state.slots =
      []

    renderAll()

    if (
      requiredOptionsComplete()
    ) {
      await loadSlots()
    } else {
      renderSlots()
    }
  }

  // =========================================================
  // RENDER GERAL
  // =========================================================

  function renderAll() {
    renderServices()
    renderProfessionals()
    updateSummary()
    updateConfirmState()
  }

  // =========================================================
  // SERVIÇOS
  // =========================================================

  function renderServices() {
    const manicure =
      []

    const pedicure =
      []

    const regularMaintenance =
      state.services.find(
        (service) =>
          getServiceType(
            service
          ) ===
          'manutencao'
      )

    const otherProfessionalMaintenance =
      state.services.find(
        (service) =>
          getServiceType(
            service
          ) ===
          'manutencao-outra'
      )

    state.services.forEach(
      (service) => {
        const type =
          getServiceType(
            service
          )

        // Manutenção de outra profissional
        // aparece dentro de Manutenção.
        if (
          type ===
          'manutencao-outra'
        ) {
          return
        }

        if (
          type ===
          'pedicure'
        ) {
          pedicure.push(
            service
          )
        } else {
          manicure.push(
            service
          )
        }
      }
    )

    el.manicure.innerHTML =
      ''

    el.pedicure.innerHTML =
      ''

    manicure.forEach(
      (service) => {
        el.manicure.appendChild(
          serviceCard(
            service,
            regularMaintenance,
            otherProfessionalMaintenance
          )
        )
      }
    )

    pedicure.forEach(
      (service) => {
        el.pedicure.appendChild(
          serviceCard(
            service,
            regularMaintenance,
            otherProfessionalMaintenance
          )
        )
      }
    )
  }

  // =========================================================
  // CARTÃO DE SERVIÇO
  // =========================================================

  function serviceCard(
    service,
    regularMaintenance,
    otherProfessionalMaintenance
  ) {
    const type =
      getServiceType(
        service
      )

    const isRegularMaintenance =
      type ===
      'manutencao'

    const maintenanceIds = [
      regularMaintenance?.id,
      otherProfessionalMaintenance?.id,
    ].filter(
      Boolean
    )

    const selected =
      isRegularMaintenance
        ? maintenanceIds.some(
            (id) =>
              state
                .selectedServices
                .includes(
                  id
                )
          )
        : state
            .selectedServices
            .includes(
              service.id
            )

    const unavailable =
      service.booking_enabled ===
        false ||
      service
        .has_eligible_professional ===
        false

    const card =
      document.createElement(
        'div'
      )

    card.className =
      `public-service-card${
        selected
          ? ' selected'
          : ''
      }${
        unavailable
          ? ' unavailable'
          : ''
      }`

    // =======================================================
    // BOTÃO PRINCIPAL
    // =======================================================

    const main =
      document.createElement(
        'button'
      )

    main.type =
      'button'

    main.className =
      'public-service-main'

    main.disabled =
      unavailable

    const unavailableLabel =
      service.booking_enabled ===
      false
        ? 'Indisponível de momento'
        : service
              .has_eligible_professional ===
            false
          ? 'Sem disponibilidade de momento'
          : ''

    main.innerHTML = `
      <span class="public-check">
        ${selected ? '✓' : ''}
      </span>

      <span class="public-service-copy">

        <strong>
          ${escapeHtml(
            getDisplayName(
              service
            )
          )}
        </strong>

        ${
          getDescription(
            service
          )
            ? `
              <small>
                ${escapeHtml(
                  getDescription(
                    service
                  )
                )}
              </small>
            `
            : ''
        }

        ${
          unavailableLabel
            ? `
              <small class="public-service-unavailable-label">
                ${escapeHtml(
                  unavailableLabel
                )}
              </small>
            `
            : ''
        }

      </span>

      <span class="public-service-price">

        ${
          service.promotion_id
            ? `
              <small
                style="
                  display:block;
                  text-decoration:line-through;
                  opacity:.55;
                  font-weight:500;
                "
              >
                ${formatPrice(
                  service.price
                )} €
              </small>

              <strong>
                ${formatPrice(
                  service.promotional_price
                )} €
              </strong>

              <small
                style="
                  display:block;
                  margin-top:2px;
                  color:#8d6f7e;
                "
              >
                -${formatDiscount(
                  service.discount_percent
                )}%
              </small>
            `
            : `
              <strong>
                ${formatPrice(
                  service.price
                )} €
              </strong>
            `
        }

      </span>
    `

    main.addEventListener(
      'click',
      async () => {
        if (
          unavailable
        ) {
          return
        }

        // ===================================================
        // MANUTENÇÃO
        // ===================================================

        if (
          isRegularMaintenance
        ) {
          const currentlySelected =
            maintenanceIds.some(
              (id) =>
                state
                  .selectedServices
                  .includes(
                    id
                  )
            )

          if (
            currentlySelected
          ) {
            state.selectedServices =
              state.selectedServices.filter(
                (id) =>
                  !maintenanceIds.includes(
                    id
                  )
              )

            maintenanceIds.forEach(
              (id) => {
                delete state
                  .procedureOptions[
                    id
                  ]

                delete state
                  .selectedServiceOptions[
                    id
                  ]
              }
            )
          } else if (
            regularMaintenance
          ) {
            state.selectedServices.push(
              regularMaintenance.id
            )

            state.procedureOptions[
              regularMaintenance.id
            ] =
              false
          }
        }

        // ===================================================
        // RESTANTES SERVIÇOS
        // ===================================================

        else {
          toggleService(
            service.id
          )
        }

        await loadProfessionals()

        state.selectedSlot =
          null

        renderAll()

        await loadSlots()
      }
    )

    card.appendChild(
      main
    )

    // =======================================================
    // MANUTENÇÃO - VARIANTES
    // =======================================================

    if (
      isRegularMaintenance &&
      selected
    ) {
      const options =
        document.createElement(
          'div'
        )

      options.className =
        'public-maintenance-options'

      // -----------------------------------------------------
      // MANUTENÇÃO NORMAL
      // -----------------------------------------------------

      if (
        regularMaintenance
      ) {
        const button =
          document.createElement(
            'button'
          )

        button.type =
          'button'

        button.className =
          `public-maintenance-option${
            state
              .selectedServices
              .includes(
                regularMaintenance.id
              )
              ? ' selected'
              : ''
          }`

        button.innerHTML = `
          <span>
            Manutenção
          </span>

          <strong>
            ${formatPrice(
              regularMaintenance
                .promotion_id
                ? regularMaintenance
                    .promotional_price
                : regularMaintenance
                    .price
            )} €
          </strong>
        `

        button.addEventListener(
          'click',
          async (event) => {
            event.stopPropagation()

            state.selectedServices =
              state.selectedServices.filter(
                (id) =>
                  !maintenanceIds.includes(
                    id
                  )
              )

            state.selectedServices.push(
              regularMaintenance.id
            )

            state.procedureOptions[
              regularMaintenance.id
            ] =
              false

            maintenanceIds.forEach(
              (id) => {
                delete state
                  .selectedServiceOptions[
                    id
                  ]
              }
            )

            if (
              otherProfessionalMaintenance
                ?.id
            ) {
              delete state
                .procedureOptions[
                  otherProfessionalMaintenance
                    .id
                ]
            }

            state.selectedSlot =
              null

            await loadProfessionals()

            renderAll()

            await loadSlots()
          }
        )

        options.appendChild(
          button
        )
      }

      // -----------------------------------------------------
      // MANUTENÇÃO DE OUTRA PROFISSIONAL
      // -----------------------------------------------------

      if (
        otherProfessionalMaintenance
      ) {
        const button =
          document.createElement(
            'button'
          )

        button.type =
          'button'

        button.className =
          `public-maintenance-option${
            state
              .selectedServices
              .includes(
                otherProfessionalMaintenance
                  .id
              )
              ? ' selected'
              : ''
          }`

        button.innerHTML = `
          <span>
            Manutenção de outra profissional
          </span>

          <strong>
            ${formatPrice(
              otherProfessionalMaintenance
                .promotion_id
                ? otherProfessionalMaintenance
                    .promotional_price
                : otherProfessionalMaintenance
                    .price
            )} €
          </strong>
        `

        button.addEventListener(
          'click',
          async (event) => {
            event.stopPropagation()

            state.selectedServices =
              state.selectedServices.filter(
                (id) =>
                  !maintenanceIds.includes(
                    id
                  )
              )

            state.selectedServices.push(
              otherProfessionalMaintenance.id
            )

            state.procedureOptions[
              otherProfessionalMaintenance.id
            ] =
              false

            maintenanceIds.forEach(
              (id) => {
                delete state
                  .selectedServiceOptions[
                    id
                  ]
              }
            )

            if (
              regularMaintenance?.id
            ) {
              delete state
                .procedureOptions[
                  regularMaintenance.id
                ]
            }

            state.selectedSlot =
              null

            await loadProfessionals()

            renderAll()

            await loadSlots()
          }
        )

        options.appendChild(
          button
        )
      }

      card.appendChild(
        options
      )
    }

    // =======================================================
    // PROCEDIMENTO
    // =======================================================

    if (
      !isRegularMaintenance &&
      selected &&
      service.has_procedure_option &&
      !isMaintenance(
        service
      )
    ) {
      const options =
        document.createElement(
          'div'
        )

      options.className =
        'public-procedure-options'

      options.innerHTML = `
        <span>
          Tem procedimento?
        </span>

        <button
          type="button"
          data-value="false"
          class="${
            !state
              .procedureOptions[
                service.id
              ]
              ? 'selected'
              : ''
          }"
        >
          Não
        </button>

        <button
          type="button"
          data-value="true"
          class="${
            state
              .procedureOptions[
                service.id
              ]
              ? 'selected'
              : ''
          }"
        >
          Sim
        </button>
      `

      options
        .querySelectorAll(
          'button'
        )
        .forEach(
          (button) => {
            button.addEventListener(
              'click',
              async (event) => {
                event.stopPropagation()

                state.procedureOptions[
                  service.id
                ] =
                  button.dataset
                    .value ===
                  'true'

                state.selectedSlot =
                  null

                renderAll()

                await loadSlots()
              }
            )
          }
        )

      card.appendChild(
        options
      )
    }

    // =======================================================
    // SERVIÇO ATIVO
    // =======================================================

    const activeServiceId =
      isRegularMaintenance
        ? (
            maintenanceIds.find(
              (id) =>
                state
                  .selectedServices
                  .includes(
                    id
                  )
            ) ||
            service.id
          )
        : service.id

    // =======================================================
    // OPÇÕES DINÂMICAS
    // Tamanho / Nail Art / futuros extras
    // =======================================================

    if (
      selected
    ) {
      const groups =
        getOptionGroups(
          activeServiceId
        )

      groups.forEach(
        (group) => {
          const panel =
            document.createElement(
              'div'
            )

          panel.className =
            'public-maintenance-options public-service-extra-group'

          // -------------------------------------------------
          // TÍTULO
          // -------------------------------------------------

          const title =
            document.createElement(
              'span'
            )

          title.className =
            'public-service-extra-title'

          title.textContent =
            `${group.name}${
              group.required
                ? ' *'
                : ''
            }`

          panel.appendChild(
            title
          )

          const selectedIds =
            state
              .selectedServiceOptions[
                activeServiceId
              ]?.[
                group.id
              ] ||
            []

          // -------------------------------------------------
          // SEM OPÇÃO
          // Ex.: Sem Nail Art
          // -------------------------------------------------

          if (
            group.selection_type ===
              'SINGLE' &&
            !group.required
          ) {
            const noneButton =
              document.createElement(
                'button'
              )

            noneButton.type =
              'button'

            noneButton.className =
              `public-maintenance-option${
                selectedIds.length ===
                0
                  ? ' selected'
                  : ''
              }`

            noneButton.innerHTML = `
              <span>
                Sem ${escapeHtml(
                  group.name
                )}
              </span>
            `

            noneButton.addEventListener(
              'click',
              async (event) => {
                event.stopPropagation()

                await selectServiceOption(
                  activeServiceId,
                  group,
                  null
                )
              }
            )

            panel.appendChild(
              noneButton
            )
          }

          // -------------------------------------------------
          // OPÇÕES
          // -------------------------------------------------

          ;(
            group.options ||
            []
          ).forEach(
            (option) => {
              const button =
                document.createElement(
                  'button'
                )

              button.type =
                'button'

              const isSelected =
                selectedIds.includes(
                  option.id
                )

              button.className =
                `public-maintenance-option${
                  isSelected
                    ? ' selected'
                    : ''
                }`

              const extraPrice =
                Number(
                  option
                    .price_delta ||
                  0
                )

              // Não mostramos a duração
              // dos extras no website.
              button.innerHTML = `
                <span>
                  ${escapeHtml(
                    option.name
                  )}
                </span>

                ${
                  extraPrice >
                  0
                    ? `
                      <strong>
                        +${formatPrice(
                          extraPrice
                        )} €
                      </strong>
                    `
                    : ''
                }
              `

              button.addEventListener(
                'click',
                async (event) => {
                  event.stopPropagation()

                  await selectServiceOption(
                    activeServiceId,
                    group,
                    option.id
                  )
                }
              )

              panel.appendChild(
                button
              )
            }
          )

          card.appendChild(
            panel
          )
        }
      )
    }

    return card
  }

  // =========================================================
  // SELECIONAR / REMOVER SERVIÇO
  // =========================================================

  function toggleService(
    serviceId
  ) {
    if (
      state
        .selectedServices
        .includes(
          serviceId
        )
    ) {
      state.selectedServices =
        state.selectedServices.filter(
          (id) =>
            id !==
            serviceId
        )

      delete state
        .procedureOptions[
          serviceId
        ]

      delete state
        .selectedServiceOptions[
          serviceId
        ]
    } else {
      state.selectedServices.push(
        serviceId
      )

      state.procedureOptions[
        serviceId
      ] =
        false
    }
  }

  // =========================================================
  // RENDER PROFISSIONAIS
  // =========================================================

  function renderProfessionals() {
    // =======================================================
    // AGENDA INDIVIDUAL
    //
    // Não desenhar qualquer seletor.
    // =======================================================

    if (
      state.fixedProfessional
    ) {
      state.professionals = [
        state.fixedProfessional,
      ]

      state.selectedProfessional =
        state.fixedProfessional.id

      return
    }

    // =======================================================
    // WEBSITE NORMAL
    // =======================================================

    if (
      !state.selectedServices.length
    ) {
      el.professionals.innerHTML =
        '<p class="public-muted">Selecione primeiro um serviço.</p>'

      return
    }

    if (
      !state.professionals.length
    ) {
      el.professionals.innerHTML =
        '<p class="public-muted">Nenhuma profissional realiza todos os serviços selecionados.</p>'

      return
    }

    el.professionals.innerHTML =
      ''

    // -------------------------------------------------------
    // QUALQUER PROFISSIONAL
    // -------------------------------------------------------

    el.professionals.appendChild(
      professionalButton({
        id:
          'ANY',

        display_name:
          'Qualquer profissional',

        avatar_path:
          null,
      })
    )

    // -------------------------------------------------------
    // PROFISSIONAIS
    // -------------------------------------------------------

    state.professionals.forEach(
      (professional) => {
        el.professionals.appendChild(
          professionalButton(
            professional
          )
        )
      }
    )
  }

  // =========================================================
  // BOTÃO DE PROFISSIONAL
  // =========================================================

  function professionalButton(
    professional
  ) {
    const button =
      document.createElement(
        'button'
      )

    button.type =
      'button'

    button.className =
      `public-professional-card${
        state.selectedProfessional ===
        professional.id
          ? ' selected'
          : ''
      }`

    const avatar =
      professional.avatar_path
        ? getAvatarUrl(
            professional
              .avatar_path
          )
        : ''

    button.innerHTML = `
      <span class="public-professional-avatar">

        ${
          avatar
            ? `
              <img
                src="${avatar}"
                alt=""
              >
            `
            : escapeHtml(
                professional.id ===
                  'ANY'
                  ? '★'
                  : (
                      professional
                        .display_name ||
                      '?'
                    )
                      .charAt(
                        0
                      )
                      .toUpperCase()
              )
        }

      </span>

      <strong>
        ${escapeHtml(
          professional
            .display_name
        )}
      </strong>
    `

    button.addEventListener(
      'click',
      async () => {
        // Segurança extra:
        // numa agenda individual nunca
        // permitimos trocar a profissional.
        if (
          state.fixedProfessional
        ) {
          return
        }

        state.selectedProfessional =
          professional.id

        state.selectedSlot =
          null

        renderProfessionals()

        updateSummary()

        await loadSlots()
      }
    )

    return button
  }

  // =========================================================
  // CARREGAR HORÁRIOS
  // =========================================================

  async function loadSlots() {
    showError('')

    if (
      !state.selectedServices.length
    ) {
      state.slots =
        []

      state.selectedSlot =
        null

      renderSlots()

      return
    }

    // Não pesquisar enquanto
    // faltar uma opção obrigatória.
    if (
      !requiredOptionsComplete()
    ) {
      state.slots =
        []

      state.selectedSlot =
        null

      el.slotsStatus.textContent =
        'Escolha as opções obrigatórias.'

      el.nextButton.hidden =
        true

      renderSlots()

      return
    }

    el.slotsStatus.textContent =
      'A procurar horários...'

    el.slots.innerHTML =
      ''

    let data
    let error

    // =======================================================
    // QUALQUER PROFISSIONAL
    // =======================================================

    if (
      state.selectedProfessional ===
      'ANY'
    ) {
      const result =
        await client.rpc(
          'public_get_auto_available_slots_with_options',
          {
            p_service_ids:
              state.selectedServices,

            p_has_procedure:
              getProcedureArray(),

            p_work_date:
              state.selectedDate,

            p_option_selections:
              getOptionSelectionsPayload(),
          }
        )

      data =
        result.data

      error =
        result.error
    }

    // =======================================================
    // PROFISSIONAL ESPECÍFICA
    // Inclui /gabriela
    // =======================================================

    else {
      const result =
        await client.rpc(
          'public_get_available_slots_with_options',
          {
            p_professional_id:
              state
                .selectedProfessional,

            p_service_ids:
              state.selectedServices,

            p_has_procedure:
              getProcedureArray(),

            p_work_date:
              state.selectedDate,

            p_option_selections:
              getOptionSelectionsPayload(),
          }
        )

      data =
        result.data

      error =
        result.error
    }

    if (
      error
    ) {
      console.error(
        'Erro nos horários:',
        error
      )

      state.slots =
        []

      state.selectedSlot =
        null

      el.slotsStatus.textContent =
        ''

      showError(
        'Não foi possível carregar os horários disponíveis.'
      )

      renderSlots()

      return
    }

    state.slots =
      data || []

    state.selectedSlot =
      null

    renderSlots()
  }

  // =========================================================
  // RENDER HORÁRIOS
  // =========================================================

  function renderSlots() {
    el.slots.innerHTML =
      ''

    el.nextList.innerHTML =
      ''

    if (
      !state.selectedServices.length
    ) {
      el.slotsStatus.textContent =
        'Selecione pelo menos um serviço.'

      el.nextButton.hidden =
        true

      updateSummary()
      updateConfirmState()

      return
    }

    if (
      !state.selectedProfessional
    ) {
      el.slotsStatus.textContent =
        'Selecione uma profissional.'

      el.nextButton.hidden =
        true

      updateSummary()
      updateConfirmState()

      return
    }

    if (
      !requiredOptionsComplete()
    ) {
      el.slotsStatus.textContent =
        'Escolha as opções obrigatórias.'

      el.nextButton.hidden =
        true

      updateSummary()
      updateConfirmState()

      return
    }

    if (
      !state.slots.length
    ) {
      el.slotsStatus.textContent =
        'Sem disponibilidade para esta data.'

      el.nextButton.hidden =
        false

      el.nextButton.textContent =
        'Procurar próxima disponibilidade'

      updateSummary()
      updateConfirmState()

      return
    }

    el.slotsStatus.textContent =
      'Escolha um horário'

    el.nextButton.hidden =
      true

    state.slots.forEach(
      (slot) => {
        const button =
          document.createElement(
            'button'
          )

        button.type =
          'button'

        button.className =
          `public-slot-button${
            state.selectedSlot
              ?.slot_start ===
            slot.slot_start
              ? ' selected'
              : ''
          }`

        button.textContent =
          formatTime(
            slot.slot_start
          )

        button.addEventListener(
          'click',
          () => {
            state.selectedSlot =
              slot

            renderSlots()
          }
        )

        el.slots.appendChild(
          button
        )
      }
    )

    updateSummary()
    updateConfirmState()
  }

  // =========================================================
  // PRÓXIMA DISPONIBILIDADE
  // =========================================================

  async function searchNextAvailability() {
    showError('')

    if (
      !state.selectedServices.length
    ) {
      showError(
        'Selecione primeiro um serviço.'
      )

      return
    }

    if (
      !state.selectedProfessional
    ) {
      showError(
        'Selecione uma profissional.'
      )

      return
    }

    if (
      !requiredOptionsComplete()
    ) {
      showError(
        'Selecione todas as opções obrigatórias.'
      )

      return
    }

    el.nextButton.disabled =
      true

    el.nextButton.textContent =
      'A procurar...'

    el.nextList.innerHTML =
      ''

    const currentDate =
      new Date(
        `${state.selectedDate}T12:00:00`
      )

    let found =
      null

    for (
      let offset = 1;
      offset <= 45;
      offset += 1
    ) {
      const date =
        new Date(
          currentDate
        )

      date.setDate(
        date.getDate() +
        offset
      )

      const dateString =
        getLocalDateString(
          date
        )

      let data
      let error

      // -----------------------------------------------------
      // QUALQUER PROFISSIONAL
      // -----------------------------------------------------

      if (
        state.selectedProfessional ===
        'ANY'
      ) {
        const result =
          await client.rpc(
            'public_get_auto_available_slots_with_options',
            {
              p_service_ids:
                state.selectedServices,

              p_has_procedure:
                getProcedureArray(),

              p_work_date:
                dateString,

              p_option_selections:
                getOptionSelectionsPayload(),
            }
          )

        data =
          result.data

        error =
          result.error
      }

      // -----------------------------------------------------
      // PROFISSIONAL ESPECÍFICA
      // -----------------------------------------------------

      else {
        const result =
          await client.rpc(
            'public_get_available_slots_with_options',
            {
              p_professional_id:
                state
                  .selectedProfessional,

              p_service_ids:
                state.selectedServices,

              p_has_procedure:
                getProcedureArray(),

              p_work_date:
                dateString,

              p_option_selections:
                getOptionSelectionsPayload(),
            }
          )

        data =
          result.data

        error =
          result.error
      }

      if (
        error
      ) {
        console.error(
          'Erro ao procurar próxima disponibilidade:',
          error
        )

        continue
      }

      if (
        data &&
        data.length
      ) {
        found = {
          date:
            dateString,

          slots:
            data,
        }

        break
      }
    }

    el.nextList.innerHTML =
      ''

    // =======================================================
    // NÃO ENCONTROU
    // =======================================================

    if (
      !found
    ) {
      el.nextList.innerHTML =
        '<p class="public-muted">Não encontrámos disponibilidade nos próximos 45 dias.</p>'

      el.nextButton.disabled =
        false

      el.nextButton.textContent =
        'Procurar próxima disponibilidade'

      return
    }

    // =======================================================
    // MOSTRAR RESULTADO
    // =======================================================

    const row =
      document.createElement(
        'div'
      )

    row.className =
      'public-next-day'

    row.innerHTML = `
      <strong>
        ${escapeHtml(
          formatDate(
            found.date
          )
        )}
      </strong>
    `

    const buttons =
      document.createElement(
        'div'
      )

    found.slots.forEach(
      (slot) => {
        const button =
          document.createElement(
            'button'
          )

        button.type =
          'button'

        button.textContent =
          formatTime(
            slot.slot_start
          )

        button.addEventListener(
          'click',
          async () => {
            state.selectedDate =
              found.date

            el.date.value =
              found.date

            state.slots =
              found.slots

            state.selectedSlot =
              slot

            el.nextList.innerHTML =
              ''

            // Atualizar promoções
            // para a nova data.
            await loadServices()

            renderServices()

            await loadProfessionals()

            renderProfessionals()

            renderSlots()

            updateSummary()
          }
        )

        buttons.appendChild(
          button
        )
      }
    )

    row.appendChild(
      buttons
    )

    el.nextList.appendChild(
      row
    )

    el.nextButton.disabled =
      false

    el.nextButton.textContent =
      'Procurar próxima disponibilidade'
  }

  // =========================================================
  // CRIAR MARCAÇÃO
  // =========================================================

  async function createBooking() {
    showError('')

    const normalizedPhone =
      normalizePhone(
        el.phone.value
      )

    if (
      !el.name.value.trim()
    ) {
      return showError(
        'Introduza o seu nome.'
      )
    }

    if (
      !/^\+[1-9][0-9]{7,14}$/.test(
        normalizedPhone
      )
    ) {
      return showError(
        'Introduza um número de telemóvel válido.'
      )
    }

    if (
      !state.selectedServices.length
    ) {
      return showError(
        'Selecione pelo menos um serviço.'
      )
    }

    if (
      !requiredOptionsComplete()
    ) {
      return showError(
        'Selecione todas as opções obrigatórias.'
      )
    }

    if (
      !state.selectedProfessional
    ) {
      return showError(
        'Selecione uma profissional.'
      )
    }

    if (
      !state.selectedSlot
    ) {
      return showError(
        'Selecione um horário.'
      )
    }

    el.confirm.disabled =
      true

    el.confirm.textContent =
      'A confirmar...'

    const automatic =
      state.selectedProfessional ===
      'ANY'

    const rpcName =
      automatic
        ? 'public_create_booking_any_with_options'
        : 'public_create_booking_with_options'

    const commonArgs = {
      p_client_name:
        el.name.value.trim(),

      p_phone_e164:
        normalizedPhone,

      p_email:
        el.email.value.trim() ||
        null,

      p_service_ids:
        state.selectedServices,

      p_has_procedure:
        getProcedureArray(),

      p_start_at:
        state
          .selectedSlot
          .slot_start,

      p_notes_client:
        el.notes.value.trim() ||
        null,

      p_option_selections:
        getOptionSelectionsPayload(),
    }

    const rpcArgs =
      automatic
        ? commonArgs
        : {
            ...commonArgs,

            p_professional_id:
              state
                .selectedProfessional,
          }

    const {
      data,
      error,
    } = await client.rpc(
      rpcName,
      rpcArgs
    )

    if (
      error
    ) {
      console.error(
        'Erro ao criar marcação:',
        error
      )

      el.confirm.textContent =
        'Confirmar marcação'

      updateConfirmState()

      if (
        String(
          error.message ||
          ''
        )
          .toLowerCase()
          .includes(
            'dispon'
          )
      ) {
        showError(
          'Este horário acabou de ficar indisponível. Escolha outro horário.'
        )

        await loadSlots()

        return
      }

      showError(
        error.message ||
        'Não foi possível confirmar a marcação.'
      )

      return
    }

    const result =
      data?.[0] ||
      null

    // =======================================================
    // NOME DA PROFISSIONAL
    // =======================================================

    let professionalName =
      ''

    if (
      state.fixedProfessional
    ) {
      professionalName =
        state.fixedProfessional
          .display_name
    } else if (
      automatic
    ) {
      professionalName =
        result
          ?.professional_name ||
        'Profissional atribuída'
    } else {
      professionalName =
        state.professionals.find(
          (professional) =>
            professional.id ===
            state.selectedProfessional
        )?.display_name ||
        'Profissional'
    }

    // =======================================================
    // SUCESSO
    // =======================================================

    el.app.style.display =
      'none'

    el.success.hidden =
      false

    el.success.style.display =
      'block'

    el.success.innerHTML = `
      <div class="public-success-icon">
        ✓
      </div>

      <p class="eyebrow">
        Marcação confirmada
      </p>

      <p>

        ${escapeHtml(
          el.name.value.trim()
        )},

        a sua marcação ficou registada

        para

        <strong>
          ${escapeHtml(
            formatDate(
              state.selectedDate
            )
          )}
        </strong>

        às

        <strong>
          ${escapeHtml(
            formatTime(
              state
                .selectedSlot
                .slot_start
            )
          )}
        </strong>

        com

        <strong>
          ${escapeHtml(
            professionalName
          )}
        </strong>.

      </p>

      <a
        href="/"
        class="button"
      >
        Voltar ao início
      </a>
    `

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    })
  }

  // =========================================================
  // RESUMO
  // =========================================================

  function updateSummary() {
    const selected =
      state.selectedServices
        .map(
          (id) =>
            state.services.find(
              (service) =>
                service.id ===
                id
            )
        )
        .filter(
          Boolean
        )

    // =======================================================
    // SERVIÇOS + OPÇÕES
    // =======================================================

    el.summaryServices.textContent =
      selected.length
        ? selected
            .map(
              (service) => {
                const selectedIds =
                  getSelectedOptionIds(
                    service.id
                  )

                const optionLabels =
                  getOptionGroups(
                    service.id
                  )
                    .flatMap(
                      (group) =>
                        (
                          group.options ||
                          []
                        )
                          .filter(
                            (option) =>
                              selectedIds.includes(
                                option.id
                              )
                          )
                          .map(
                            (option) =>
                              option.name
                          )
                    )

                if (
                  optionLabels.length
                ) {
                  return `${getDisplayName(
                    service
                  )} (${optionLabels.join(
                    ', '
                  )})`
                }

                return getDisplayName(
                  service
                )
              }
            )
            .join(
              ' + '
            )
        : '—'

    // =======================================================
    // PROFISSIONAL
    // =======================================================

    if (
      state.fixedProfessional
    ) {
      el.summaryProfessional.textContent =
        state.fixedProfessional
          .display_name
    } else if (
      state.selectedProfessional ===
      'ANY'
    ) {
      el.summaryProfessional.textContent =
        state.selectedServices.length
          ? 'Qualquer profissional'
          : '—'
    } else {
      el.summaryProfessional.textContent =
        state.professionals.find(
          (professional) =>
            professional.id ===
            state.selectedProfessional
        )?.display_name ||
        '—'
    }

    // =======================================================
    // DATA
    // =======================================================

    el.summaryDate.textContent =
      state.selectedDate
        ? formatDate(
            state.selectedDate
          )
        : '—'

    // =======================================================
    // HORA
    // =======================================================

    el.summaryTime.textContent =
      state.selectedSlot
        ? formatTime(
            state
              .selectedSlot
              .slot_start
          )
        : '—'

    // =======================================================
    // PREÇO
    //
    // (serviço + procedimento) - promoção
    // +
    // extras sem desconto
    // =======================================================

    const total =
      selected.reduce(
        (
          sum,
          service
        ) => {
          const procedureExtra =
            state
              .procedureOptions[
                service.id
              ]
              ? Number(
                  service
                    .procedure_price_delta ||
                  0
                )
              : 0

          const baseTotal =
            Number(
              service.price ||
              0
            ) +
            procedureExtra

          const discount =
            service.promotion_id
              ? Number(
                  service
                    .discount_percent ||
                  0
                )
              : 0

          const discountedBase =
            discount >
            0
              ? baseTotal *
                (
                  1 -
                  discount /
                    100
                )
              : baseTotal

          const optionExtra =
            getOptionExtraPrice(
              service.id
            )

          return (
            sum +
            discountedBase +
            optionExtra
          )
        },
        0
      )

    el.summaryPrice.textContent =
      `${formatPrice(
        total
      )} €`

    updateConfirmState()
  }

  // =========================================================
  // BOTÃO CONFIRMAR
  // =========================================================

  function updateConfirmState() {
    const normalizedPhone =
      normalizePhone(
        el.phone.value
      )

    el.confirm.disabled =
      !(
        el.name.value.trim() &&
        /^\+[1-9][0-9]{7,14}$/.test(
          normalizedPhone
        ) &&
        state
          .selectedServices
          .length &&
        requiredOptionsComplete() &&
        state.selectedProfessional &&
        state.selectedSlot
      )
  }

  // =========================================================
  // PROCEDIMENTO
  // =========================================================

  function getProcedureArray() {
    return state
      .selectedServices
      .map(
        (id) =>
          Boolean(
            state
              .procedureOptions[
                id
              ]
          )
      )
  }

  // =========================================================
  // TELEFONE
  // =========================================================

  function normalizePhone(
    value
  ) {
    let cleaned =
      String(
        value ||
        ''
      )
        .trim()
        .replace(
          /[()\s-]/g,
          ''
        )

    if (
      cleaned.startsWith(
        '00'
      )
    ) {
      cleaned =
        `+${cleaned.slice(
          2
        )}`
    }

    if (
      /^\d{9}$/.test(
        cleaned
      )
    ) {
      cleaned =
        `+351${cleaned}`
    }

    if (
      /^351\d{9}$/.test(
        cleaned
      )
    ) {
      cleaned =
        `+${cleaned}`
    }

    return cleaned
  }

  // =========================================================
  // NORMALIZAÇÃO TEXTO
  // =========================================================

  function normalizeText(
    value = ''
  ) {
    return value
      .trim()
      .toLowerCase()
      .normalize(
        'NFD'
      )
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
  }

  // =========================================================
  // TIPO DE SERVIÇO
  // =========================================================

  function getServiceType(
    service
  ) {
    const name =
      normalizeText(
        service?.name
      )

    if (
      [
        'gelinho nos pes',
        'pedicure gelinho',
        'pedicure',
        'pedicure premium',
      ].includes(
        name
      )
    ) {
      return 'pedicure'
    }

    if (
      name ===
      'manutencao'
    ) {
      return 'manutencao'
    }

    if (
      name ===
      'manutencao de outra profissional'
    ) {
      return 'manutencao-outra'
    }

    return 'manicure'
  }

  function isMaintenance(
    service
  ) {
    return getServiceType(
      service
    ).startsWith(
      'manutencao'
    )
  }

  // =========================================================
  // NOME VISÍVEL
  // =========================================================

 function getDisplayName(
  service
) {
  return (
    service?.name ||
    'Serviço'
  )
}

  // =========================================================
  // DESCRIÇÃO
  // =========================================================

  function getDescription(
    service
  ) {
    const name =
      normalizeText(
        service?.name
      )

    if (
      name ===
        'pedicure' ||
      name ===
        'pedicure premium'
    ) {
      return (
        service
          ?.description ||
        ''
      )
    }

    return ''
  }

  // =========================================================
  // AVATAR
  // =========================================================

  function getAvatarUrl(
    avatarPath
  ) {
    if (
      !avatarPath
    ) {
      return ''
    }

    const {
      data,
    } =
      client.storage
        .from(
          'professional-avatars'
        )
        .getPublicUrl(
          avatarPath
        )

    return (
      data?.publicUrl ||
      ''
    )
  }

  // =========================================================
  // DATA LOCAL
  // =========================================================

  function getLocalDateString(
    date
  ) {
    const year =
      date.getFullYear()

    const month =
      String(
        date.getMonth() +
        1
      ).padStart(
        2,
        '0'
      )

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      )

    return `${year}-${month}-${day}`
  }

  // =========================================================
  // FORMATAR DATA
  // =========================================================

  function formatDate(
    value
  ) {
    if (
      !value
    ) {
      return '—'
    }

    return new Intl
      .DateTimeFormat(
        'pt-PT',
        {
          weekday:
            'long',

          day:
            'numeric',

          month:
            'long',

          year:
            'numeric',
        }
      )
      .format(
        new Date(
          `${value}T12:00:00`
        )
      )
  }

  // =========================================================
  // FORMATAR HORA
  // =========================================================

  function formatTime(
    value
  ) {
    if (
      !value
    ) {
      return '—'
    }

    return new Intl
      .DateTimeFormat(
        'pt-PT',
        {
          hour:
            '2-digit',

          minute:
            '2-digit',
        }
      )
      .format(
        new Date(
          value
        )
      )
  }

  // =========================================================
  // FORMATAR PREÇO
  // =========================================================

  function formatPrice(
    value
  ) {
    return Number(
      value ||
      0
    ).toLocaleString(
      'pt-PT',
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    )
  }

  // =========================================================
  // FORMATAR DESCONTO
  // =========================================================

  function formatDiscount(
    value
  ) {
    return Number(
      value ||
      0
    ).toLocaleString(
      'pt-PT',
      {
        maximumFractionDigits:
          2,
      }
    )
  }

  // =========================================================
  // ERROS
  // =========================================================

  function showError(
    message
  ) {
    if (
      !el.error
    ) {
      return
    }

    if (
      !message
    ) {
      el.error.textContent =
        ''

      el.error.hidden =
        true

      return
    }

    el.error.textContent =
      message

    el.error.hidden =
      false
  }

  // =========================================================
  // ESCAPE HTML
  // =========================================================

  function escapeHtml(
    value
  ) {
    return String(
      value ??
      ''
    )
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      )
  }
})()